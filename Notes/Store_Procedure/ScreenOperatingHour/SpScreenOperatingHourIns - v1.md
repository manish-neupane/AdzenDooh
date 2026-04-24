-- =============================================
-- Author:      Manish
-- Create date: 24.04.2026
-- Description: Insert new operating hour slots for a Screen.
--              Checks overlap against existing active slots in DB.
-- Input  : [ { ScreenId, CreatedBy, DayOfWeek, StartTime, EndTime, AverageAudienceCount } ]
-- Output : Newly inserted slots as JSON
/*
DECLARE @Json NVARCHAR(MAX) = N'[
    {
        "ScreenId":             1,
        "CreatedBy":            1,
        "DayOfWeek":            0,
        "StartTime":            "2026-01-01T09:00:00",
        "EndTime":              "2026-01-01T11:00:00",
        "AverageAudienceCount": 80
    },
    {
        "ScreenId":             1,
        "CreatedBy":            1,
        "DayOfWeek":            0,
        "StartTime":            "2026-01-01T17:00:00",
        "EndTime":              "2026-01-01T19:00:00",
        "AverageAudienceCount": 120
    }
]'
EXEC inv.SpScreenOperatingHourIns @Json OUTPUT;
SELECT @Json AS JsonOutput;
*/
-- =============================================
CREATE OR ALTER PROCEDURE inv.SpScreenOperatingHourIns
(
    @Json NVARCHAR(MAX) OUTPUT
)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        CREATE TABLE #Inserted
        (
            Id INT NOT NULL
        );

        CREATE TABLE #ScreenOperatingHour
        (
            RowId                INT      IDENTITY(1,1),
            ScreenId             INT      NOT NULL,
            CreatedBy            INT      NOT NULL,
            DayOfWeek            TINYINT  NOT NULL,
            StartTime            DATETIME NOT NULL,
            EndTime              DATETIME NOT NULL,
            AverageAudienceCount INT      NULL
        );

        INSERT INTO #ScreenOperatingHour
        (
            ScreenId,
            CreatedBy,
            DayOfWeek,
            StartTime,
            EndTime,
            AverageAudienceCount
        )
        SELECT
            ScreenId,
            CreatedBy,
            DayOfWeek,
            StartTime,
            EndTime,
            AverageAudienceCount
        FROM OPENJSON(@Json)
        WITH
        (
            ScreenId             INT,
            CreatedBy            INT,
            DayOfWeek            TINYINT,
            StartTime            DATETIME,
            EndTime              DATETIME,
            AverageAudienceCount INT
        );

        -- Validate screen exists and is not deleted
        IF NOT EXISTS
        (
            SELECT 1 FROM inv.Screen s
            INNER JOIN #ScreenOperatingHour ts ON s.Id = ts.ScreenId
            WHERE s.IsDeleted = 0
        )
        BEGIN
            ROLLBACK TRANSACTION;
            SET @Json = '{"Type":"NotFound","Message":"Screen not found or has been deleted"}';
            RETURN;
        END

        -- Overlap check within incoming slots using RowId
        IF EXISTS
        (
            SELECT 1
            FROM #ScreenOperatingHour a
            INNER JOIN #ScreenOperatingHour b
                ON  a.DayOfWeek = b.DayOfWeek
                AND a.RowId     < b.RowId
            WHERE a.StartTime < b.EndTime
              AND a.EndTime   > b.StartTime
        )
        BEGIN
            ROLLBACK TRANSACTION;
            SET @Json = '{"Type":"Overlap","Message":"One or more incoming slots overlap each other"}';
            RETURN;
        END

        -- Overlap check against existing active slots in DB
        IF EXISTS
        (
            SELECT 1
            FROM #ScreenOperatingHour ts
            INNER JOIN inv.ScreenOperatingHour soh
                ON  soh.ScreenId  = ts.ScreenId
                AND soh.DayOfWeek = ts.DayOfWeek
                AND soh.IsDeleted = 0
            WHERE ts.StartTime < soh.EndTime
              AND ts.EndTime   > soh.StartTime
        )
        BEGIN
            ROLLBACK TRANSACTION;
            SET @Json = '{"Type":"Overlap","Message":"One or more slots overlap with existing schedule"}';
            RETURN;
        END

        -- Insert new slots
        INSERT INTO inv.ScreenOperatingHour
        (
            ScreenId,
            DayOfWeek,
            StartTime,
            EndTime,
            AverageAudienceCount,
            CreatedAt,
            CreatedBy
        )
        OUTPUT INSERTED.Id INTO #Inserted(Id)
        SELECT
            ScreenId,
            DayOfWeek,
            StartTime,
            EndTime,
            AverageAudienceCount,
            GETUTCDATE(),
            CreatedBy
        FROM #ScreenOperatingHour;

        COMMIT TRANSACTION;

        SET @Json = ISNULL(
            (
                SELECT
                    soh.Id,
                    soh.ScreenId,
                    soh.DayOfWeek,
                    soh.StartTime,
                    soh.EndTime,
                    soh.AverageAudienceCount,
                    soh.CreatedAt,
                    soh.CreatedBy
                FROM inv.ScreenOperatingHour soh
                INNER JOIN #Inserted i ON soh.Id = i.Id
                ORDER BY
                    soh.DayOfWeek ASC,
                    soh.StartTime ASC
                FOR JSON PATH, INCLUDE_NULL_VALUES
            ),
            '[]'
        );

        DROP TABLE IF EXISTS #Inserted;
        DROP TABLE IF EXISTS #ScreenOperatingHour;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;