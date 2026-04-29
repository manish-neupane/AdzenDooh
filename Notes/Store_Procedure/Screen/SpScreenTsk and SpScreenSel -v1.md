
	-- =============================================
	-- Author:      Kazuko
	-- Create date: 24.04.2026
	-- Description: Paginated Screen grid with optional filters and search.
	-- Input  : { Offset, PageSize, Filter: { Status, Orientation, SearchText } }
	-- Output : { Data: [...], TotalCount: N }
	/*
	DECLARE @Json NVARCHAR(MAX) = N'{
	    "Offset":   0,
	    "PageSize": 10,
	    "Filter": {
	        "Status":      "active",
	        "Orientation": null,
	        "SearchText":  "mall"
	    }
	}'
	EXEC inv.SpScreenSel @Json;
	*/
	-- =============================================
	CREATE OR ALTER PROCEDURE inv.SpScreenSel
	(
	    @Json NVARCHAR(MAX)
	)
	AS
	BEGIN
	    SET NOCOUNT ON;

    BEGIN TRY

        DECLARE
            @Offset      INT           = ISNULL(TRY_CAST(JSON_VALUE(@Json, '$.Offset')      AS INT), 0),
            @PageSize    INT           = ISNULL(TRY_CAST(JSON_VALUE(@Json, '$.PageSize')     AS INT), 10),
            @Status      NVARCHAR(20)  = JSON_VALUE(@Json, '$.Filter.Status'),
            @Orientation NVARCHAR(20)  = JSON_VALUE(@Json, '$.Filter.Orientation'),
            @SearchText  NVARCHAR(100) = JSON_VALUE(@Json, '$.Filter.SearchText'),
            @DataJson    NVARCHAR(MAX),
            @TotalCount  INT;

        CREATE TABLE #ScreenGrid
        (
            Id          INT,
            [Name]      NVARCHAR(200),
            MacAddress  NVARCHAR(17),
            [Location]  NVARCHAR(300),
            [Address]   NVARCHAR(500),
            [Status]    NVARCHAR(20),
            Resolution  NVARCHAR(50),
            Orientation NVARCHAR(20),
            CreatedAt   DATETIME2,
            CreatedBy   INT
        );

        INSERT INTO #ScreenGrid
        (
            Id,
            [Name],
            MacAddress,
            [Location],
            [Address],
            [Status],
            Resolution,
            Orientation,
            CreatedAt,
            CreatedBy
        )
        SELECT
            s.Id,
            s.[Name],
            s.MacAddress,
            s.[Location],
            s.[Address],
            s.[Status],
            s.Resolution,
            s.Orientation,
            s.CreatedAt,
            s.CreatedBy
        FROM inv.Screen s
        WHERE s.IsDeleted = 0
          AND (@Status      IS NULL OR s.[Status]    = @Status)
          AND (@Orientation IS NULL OR s.Orientation = @Orientation)
          AND (@SearchText  IS NULL OR s.[Name]       LIKE '%' + @SearchText + '%'
                                   OR s.[Location]    LIKE '%' + @SearchText + '%'
                                   OR s.MacAddress    LIKE '%' + @SearchText + '%');

        SELECT @TotalCount = COUNT(*) FROM #ScreenGrid;

        SET @DataJson =
        (
            SELECT *
            FROM #ScreenGrid
            ORDER BY CreatedAt DESC
            OFFSET @Offset ROWS
            FETCH NEXT @PageSize ROWS ONLY
            FOR JSON PATH
        );

        SELECT '{"Data":' + ISNULL(@DataJson, '[]') + ',"TotalCount":' + CAST(@TotalCount AS NVARCHAR(10)) + '}';

        DROP TABLE IF EXISTS #ScreenGrid;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
	END;
	GO

	-- =============================================
	-- Author:      Kazuko
	-- Create date: 24.04.2026
	-- Description: Insert or Update a Screen.
	--              Id null = Insert | Id present = Update
	-- Input  : { Id, TenantId, Name, MacAddress, Location, Address, Status, Resolution, Orientation, CreatedBy/UpdatedBy }
	-- Output : Affected Screen record as JSON
	/*
	-- INSERT
	DECLARE @Json NVARCHAR(MAX) = N'{
	    "Id":          null,
	    "TenantId":    1,
	    "Name":        "Mall Entrance Display",
	    "MacAddress":  "AA:BB:CC:DD:EE:01",
	    "Location":    "Kathmandu, New Road",
	    "Address":     "Shop 4, New Road Center",
	    "Status":      "active",
	    "Resolution":  "1920x1080",
	    "Orientation": "landscape",
	    "CreatedBy":   1
	}'
	EXEC inv.SpScreenTsk @Json OUTPUT;
	SELECT @Json AS JsonOutput;
	
	-- UPDATE
	DECLARE @Json NVARCHAR(MAX) = N'{
	    "Id":          1,
	    "TenantId":    1,
	    "Name":        "Mall Entrance Display Updated",
	    "MacAddress":  "AA:BB:CC:DD:EE:01",
	    "Location":    "Kathmandu, New Road",
	    "Address":     "Shop 4, New Road Center",
	    "Status":      "inactive",
	    "Resolution":  "3840x2160",
	    "Orientation": "portrait",
	    "UpdatedBy":   1
	}'
	EXEC inv.SpScreenTsk @Json OUTPUT;
	SELECT @Json AS JsonOutput;
	*/
	-- =============================================
	CREATE OR ALTER PROCEDURE inv.SpScreenTsk
	(
	    @Json NVARCHAR(MAX) OUTPUT
	)
	AS
	BEGIN
	    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        CREATE TABLE #AffectedScreen (Id INT);

        CREATE TABLE #Screen
        (
            Id          INT             NULL,
            TenantId    INT             NOT NULL,
            [Name]      NVARCHAR(200)   NOT NULL,
            MacAddress  NVARCHAR(17)    NOT NULL,
            [Location]  NVARCHAR(300)   NOT NULL,
            [Address]   NVARCHAR(500)   NULL,
            [Status]    NVARCHAR(20)    NOT NULL,
            Resolution  NVARCHAR(50)    NULL,
            Orientation NVARCHAR(20)    NOT NULL,
            CreatedBy   INT             NULL,
            UpdatedBy   INT             NULL
        );

        INSERT INTO #Screen
        (
            Id,
            TenantId,
            [Name],
            MacAddress,
            [Location],
            [Address],
            [Status],
            Resolution,
            Orientation,
            CreatedBy,
            UpdatedBy
        )
        SELECT
            Id,
            TenantId,
            [Name],
            MacAddress,
            [Location],
            [Address],
            [Status],
            Resolution,
            Orientation,
            CreatedBy,
            UpdatedBy
        FROM OPENJSON(@Json)
        WITH
        (
            Id          INT,
            TenantId    INT,
            [Name]      NVARCHAR(200),
            MacAddress  NVARCHAR(17),
            [Location]  NVARCHAR(300),
            [Address]   NVARCHAR(500),
            [Status]    NVARCHAR(20),
            Resolution  NVARCHAR(50),
            Orientation NVARCHAR(20),
            CreatedBy   INT,
            UpdatedBy   INT
        );

        -- INSERT path
        IF (SELECT Id FROM #Screen) IS NULL
        BEGIN
            -- Duplicate MacAddress check on insert
            IF EXISTS
            (
                SELECT 1 FROM inv.Screen s
                INNER JOIN #Screen ts ON s.MacAddress = ts.MacAddress
                WHERE s.IsDeleted = 0
            )
            BEGIN
                ROLLBACK TRANSACTION;
                SET @Json = '{"Type":"Duplicate","Message":"A screen with this MAC address already exists"}';
                RETURN;
            END

            INSERT INTO inv.Screen
            (
                TenantId,
                [Name],
                MacAddress,
                [Location],
                [Address],
                [Status],
                Resolution,
                Orientation,
                CreatedAt,
                CreatedBy
            )
            OUTPUT INSERTED.Id INTO #AffectedScreen(Id)
            SELECT
                TenantId,
                [Name],
                MacAddress,
                [Location],
                [Address],
                [Status],
                Resolution,
                Orientation,
                GETUTCDATE(),
                CreatedBy
            FROM #Screen;
        END
        ELSE
        BEGIN
            -- UPDATE path
            IF NOT EXISTS
            (
                SELECT 1 FROM inv.Screen s
                INNER JOIN #Screen ts ON s.Id = ts.Id
                WHERE s.IsDeleted = 0
            )
            BEGIN
                ROLLBACK TRANSACTION;
                SET @Json = '{"Type":"NotFound","Message":"Screen not found or has been deleted"}';
                RETURN;
            END

            -- Duplicate MacAddress check on update (exclude current screen)
            IF EXISTS
            (
                SELECT 1 FROM inv.Screen s
                INNER JOIN #Screen ts ON s.MacAddress = ts.MacAddress
                WHERE s.IsDeleted = 0
                  AND s.Id <> ts.Id
            )
            BEGIN
                ROLLBACK TRANSACTION;
                SET @Json = '{"Type":"Duplicate","Message":"A screen with this MAC address already exists"}';
                RETURN;
            END

            UPDATE s
            SET
                s.[Name]      = ts.[Name],
                s.MacAddress  = ts.MacAddress,
                s.[Location]  = ts.[Location],
                s.[Address]   = ts.[Address],
                s.[Status]    = ts.[Status],
                s.Resolution  = ts.Resolution,
                s.Orientation = ts.Orientation,
                s.UpdatedAt   = GETUTCDATE(),
                s.UpdatedBy   = ts.UpdatedBy
            OUTPUT INSERTED.Id INTO #AffectedScreen(Id)
            FROM inv.Screen s
            INNER JOIN #Screen ts ON s.Id = ts.Id
            WHERE s.IsDeleted = 0;
        END

        COMMIT TRANSACTION;

        SET @Json = ISNULL(
            (
                SELECT
                    s.Id,
                    s.TenantId,
                    s.[Name],
                    s.MacAddress,
                    s.[Location],
                    s.[Address],
                    s.[Status],
                    s.Resolution,
                    s.Orientation,
                    s.CreatedAt,
                    s.CreatedBy,
                    s.UpdatedAt,
                    s.UpdatedBy
                FROM inv.Screen s
                INNER JOIN #AffectedScreen a ON s.Id = a.Id
                FOR JSON PATH, INCLUDE_NULL_VALUES
            ),
            '[]'
        );

        DROP TABLE IF EXISTS #AffectedScreen;
        DROP TABLE IF EXISTS #Screen;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
	END;