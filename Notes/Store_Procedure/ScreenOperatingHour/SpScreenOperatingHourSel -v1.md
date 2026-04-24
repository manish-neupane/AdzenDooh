	-- =============================================
	-- Author:      Kazuko
	-- Create date: 24.04.2026
	-- Description: Get all active operating hour slots for a Screen.
	-- Input  : { ScreenId }
	-- Output : JSON array of slots ordered by DayOfWeek, StartTime
	/*
	DECLARE @Json NVARCHAR(MAX) = N'{
	    "ScreenId": 1
	}'
	EXEC inv.SpScreenOperatingHourSel @Json;
	*/
	-- =============================================
	CREATE OR ALTER PROCEDURE inv.SpScreenOperatingHourSel
	(
	    @Json NVARCHAR(MAX)
	)
	AS
	BEGIN
	    SET NOCOUNT ON;

    BEGIN TRY

        DECLARE
            @ScreenId INT           = TRY_CAST(JSON_VALUE(@Json, '$.ScreenId') AS INT),
            @Result   NVARCHAR(MAX);

        IF NOT EXISTS
        (
            SELECT 1 FROM inv.Screen
            WHERE Id        = @ScreenId
              AND IsDeleted = 0
        )
        BEGIN
            SET @Result = '{"Type":"NotFound","Message":"Screen not found or has been deleted"}';
            SELECT @Result;
            RETURN;
        END

        SET @Result = ISNULL(
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
                WHERE soh.ScreenId  = @ScreenId
                  AND soh.IsDeleted = 0
                ORDER BY
                    soh.DayOfWeek ASC,
                    soh.StartTime ASC
                FOR JSON PATH, INCLUDE_NULL_VALUES
            ),
            '[]'
        );

        SELECT @Result;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
	END;
	GO