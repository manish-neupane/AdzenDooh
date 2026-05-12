USE [AdzenDooh]
GO

-- =============================================
-- Author:      Manish
-- Created:     2026-05-07
-- Description: Inserts campaign creative assignments 
--              for given screens, dates and creatives,
--              validates against campaign, screen, creative
--              and date constraints before persisting.
-- =============================================

ALTER PROCEDURE dbo.SpCampaignCreativeIns
(
    @Json NVARCHAR(MAX) OUT
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY

        -- =============================================
        -- STEP 1: Parse top-level campaign from JSON
        -- =============================================
        CREATE TABLE #Campaign
        (
            CampaignId  INT           NOT NULL,
            CreatedBy   INT           NOT NULL,
            ScreensJson NVARCHAR(MAX) NULL
        );

        INSERT INTO #Campaign 
        (
            CampaignId,
            CreatedBy,
            ScreensJson
        )
        SELECT oj.CampaignId,
               oj.CreatedBy,
               oj.Screens
        FROM OPENJSON(@Json)
        WITH (
            CampaignId INT           '$.CampaignId',
            CreatedBy  INT           '$.CreatedBy',
            Screens    NVARCHAR(MAX) '$.Screens' AS JSON
        ) AS oj;

        -- =============================================
        -- STEP 2: Parse screens with their creatives JSON
        -- =============================================
        CREATE TABLE #ScreenCreative
        (
            CampaignId    INT           NOT NULL,
            ScreenId      INT           NOT NULL,
            PlayDate      DATE          NOT NULL,
            CreatedBy     INT           NOT NULL,
            CreativesJson NVARCHAR(MAX) NULL
        );

        INSERT INTO #ScreenCreative 
        (
            CampaignId,
            ScreenId,
            PlayDate,
            CreatedBy,
            CreativesJson
        )
        SELECT c.CampaignId,
               oj.ScreenId,
               TRY_CAST(oj.PlayDate AS DATE),
               c.CreatedBy,
               oj.Creatives
        FROM #Campaign AS c
        CROSS APPLY OPENJSON(c.ScreensJson)
        WITH (
            ScreenId  INT           '$.ScreenId',
            PlayDate  NVARCHAR(50)  '$.PlayDate',
            Creatives NVARCHAR(MAX) '$.Creatives' AS JSON
        ) AS oj;

        -- =============================================
        -- STEP 3: Flatten creatives per screen
        -- =============================================
        CREATE TABLE #CampaignCreative
        (
            CampaignId   INT  NOT NULL,
            ScreenId     INT  NOT NULL,
            CreativeId   INT  NOT NULL,
            PlayDate     DATE NOT NULL,
            PlaySequence INT  NOT NULL,
            CreatedBy    INT  NOT NULL
        );

        INSERT INTO #CampaignCreative 
        (
            CampaignId,
            ScreenId,
            CreativeId,
            PlayDate,
            PlaySequence,
            CreatedBy
        )
        SELECT sc.CampaignId,
               sc.ScreenId,
               oj.CreativeId,
               sc.PlayDate,
               oj.PlaySequence,
               sc.CreatedBy
        FROM #ScreenCreative AS sc
        CROSS APPLY OPENJSON(sc.CreativesJson)
        WITH (
            CreativeId   INT '$.CreativeId',
            PlaySequence INT '$.PlaySequence'
        ) AS oj;

        -- =============================================
        -- STEP 4: Insert into CampaignCreative table
        -- =============================================
        CREATE TABLE #Inserted
        (
            Id INT NOT NULL
        );

        BEGIN TRANSACTION;

            INSERT INTO dbo.CampaignCreative 
            (
                CampaignId,
                CreativeId,
                ScreenId,
                PlayDate,
                PlaySequence,
                CreatedBy,
                CreatedAt
            )
            OUTPUT INSERTED.Id INTO #Inserted (Id)
            SELECT cc.CampaignId,
                   cc.CreativeId,
                   cc.ScreenId,
                   cc.PlayDate,
                   cc.PlaySequence,
                   cc.CreatedBy,
                   GETUTCDATE()
            FROM #CampaignCreative AS cc
            INNER JOIN dbo.Campaign       AS c  ON c.Id          = cc.CampaignId AND c.IsDeleted  = 0
            INNER JOIN dbo.CampaignScreen AS cs  ON cs.CampaignId = cc.CampaignId AND cs.ScreenId  = cc.ScreenId
            INNER JOIN dbo.Creative       AS cr  ON cr.Id         = cc.CreativeId AND cr.TenantId  = c.TenantId AND cr.IsDeleted = 0
            INNER JOIN dbo.CampaignDate   AS cd  ON cd.CampaignId = cc.CampaignId
                   AND cc.PlayDate BETWEEN CAST(cd.StartDate AS DATE) AND CAST(cd.EndDate AS DATE)
            WHERE cc.PlayDate IS NOT NULL;

        COMMIT TRANSACTION;

        -- =============================================
        -- STEP 5: Return inserted records as JSON
        -- =============================================
        SELECT @Json = ISNULL((
            SELECT cc.Id           AS CampaignCreativeId,
                   cc.CampaignId,
                   cc.ScreenId,
                   s.Name          AS ScreenName,
                   cc.CreativeId,
                   cr.Name         AS CreativeName,
                   cc.PlayDate,
                   cc.PlaySequence,
                   cc.CreatedAt
            FROM #Inserted AS i
            INNER JOIN dbo.CampaignCreative AS cc ON cc.Id = i.Id
            INNER JOIN inv.Screen           AS s  ON s.Id  = cc.ScreenId  AND s.IsDeleted  = 0
            INNER JOIN dbo.Creative         AS cr ON cr.Id = cc.CreativeId AND cr.IsDeleted = 0
            FOR JSON PATH, INCLUDE_NULL_VALUES
        ), '[]');

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- =============================================
-- EXECUTE BLOCK: Mimic incoming API payload
-- =============================================
DECLARE @Json NVARCHAR(MAX) = N'{
    "CampaignId": 3,
    "CreatedBy": 1,
    "Screens": [
        {
            "ScreenId": 1,
            "PlayDate": "2026-06-07",
            "Creatives": [
                { "CreativeId": 10, "PlaySequence": 1 },
                { "CreativeId": 10, "PlaySequence": 2 },
               
            ]
        }
       {
            "ScreenId": 2,
            "PlayDate": "2026-06-07",
            "Creatives": [
                { "CreativeId": 20, "PlaySequence": 1 },
                { "CreativeId": 50, "PlaySequence": 2 },
               
            ]
        }
    ]
}';

EXEC dbo.SpCampaignCreativeIns @Json = @Json OUT;

SELECT @Json AS Result;
GO