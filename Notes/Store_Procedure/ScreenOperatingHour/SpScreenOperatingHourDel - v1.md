	-- =============================================
	-- Author:      Manish
	-- Create date: 24.04.2026
	-- Description: Soft delete a single operating hour slot.
	-- Input  : { Id, DeletedBy }
	-- Output : Deleted slot as JSON
	/*
	DECLARE @Json NVARCHAR(MAX) = N'{
	    "Id":        1,
	    "DeletedBy": 1
	}'
	EXEC inv.SpScreenOperatingHourDel @Json OUTPUT;
	SELECT @Json AS JsonOutput;
	*/
	-- =============================================
	CREATE OR ALTER PROCEDURE inv.SpScreenOperatingHourDel
	(
	    @Json NVARCHAR(MAX) OUTPUT
	)
	AS
	BEGIN
	    SET NOCOUNT ON;
	
	    BEGIN TRY
	        BEGIN TRANSACTION;
	
	        DECLARE
	            @Id        INT = TRY_CAST(JSON_VALUE(@Json, '$.Id')        AS INT),
	            @DeletedBy INT = TRY_CAST(JSON_VALUE(@Json, '$.DeletedBy') AS INT);
	
	        -- Check slot exists and is not deleted
	        IF NOT EXISTS
	        (
	            SELECT 1 FROM inv.ScreenOperatingHour
	            WHERE Id        = @Id
	              AND IsDeleted = 0
	        )
	        BEGIN
	            ROLLBACK TRANSACTION;
	            SET @Json = '{"Type":"NotFound","Message":"Slot not found or already deleted"}';
	            RETURN;
	        END
	
	        -- Soft delete
	        UPDATE inv.ScreenOperatingHour
	        SET
	            IsDeleted = 1,
	            DeletedAt = GETUTCDATE(),
	            DeletedBy = @DeletedBy
	        WHERE Id        = @Id
	          AND IsDeleted = 0;
	
	        COMMIT TRANSACTION;
	
	        SET @Json = ISNULL(
	            (
	                SELECT
	                    soh.Id,
	                    soh.ScreenId,
	                    soh.DayOfWeek,
	                    soh.StartTime,
	                    soh.EndTime,
	                    soh.IsDeleted,
	                    soh.DeletedAt,
	                    soh.DeletedBy
	                FROM inv.ScreenOperatingHour AS soh
	                WHERE soh.Id = @Id
	                FOR JSON PATH, INCLUDE_NULL_VALUES
	            ),
	            '[]'
	        );
	
	        DROP TABLE IF EXISTS #Deleted;
	
	    END TRY
	    BEGIN CATCH
	        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
	        THROW;
	    END CATCH
	END;