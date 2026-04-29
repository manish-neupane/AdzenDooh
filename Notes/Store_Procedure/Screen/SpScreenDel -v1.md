	-- =============================================
	-- Author:      Kazuko
	-- Create date: 24.04.2026
	-- Description: Soft delete a Screen and its operating hour slots.
	-- Input  : { Id, DeletedBy }
	-- Output : Deleted Screen record as JSON
	/*
	DECLARE @Json NVARCHAR(MAX) = N'{
	    "Id":        1,
	    "DeletedBy": 1
	}'
	EXEC inv.SpScreenDel @Json OUTPUT;
	SELECT @Json AS JsonOutput;
	*/
	-- =============================================
	CREATE OR ALTER PROCEDURE inv.SpScreenDel
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
	
	        IF NOT EXISTS
	        (
	            SELECT 1 FROM inv.Screen
	            WHERE Id        = @Id
	              AND IsDeleted = 0
	        )
	        BEGIN
	            ROLLBACK TRANSACTION;
	            SET @Json = '{"Type":"NotFound","Message":"Screen not found or already deleted"}';
	            RETURN;
	        END
	
	        -- Soft delete operating hour slots
	        UPDATE inv.ScreenOperatingHour
	        SET
	            IsDeleted = 1,
	            DeletedAt = GETUTCDATE(),
	            DeletedBy = @DeletedBy
	        WHERE ScreenId  = @Id
	          AND IsDeleted = 0;
	
	        -- Soft delete screen
	        UPDATE inv.Screen
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
	                    s.Id,
	                    s.[Name],
	                    s.[Location],
	                    s.[Status],
	                    s.IsDeleted,
	                    s.DeletedAt,
	                    s.DeletedBy
	                FROM inv.Screen s
	                WHERE s.Id = @Id
	                FOR JSON PATH, INCLUDE_NULL_VALUES
	            ),
	            '[]'
	        );
	
	        DROP TABLE IF EXISTS #DeletedScreen;
	
	    END TRY
	    BEGIN CATCH
	        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
	        THROW;
	    END CATCH
	END;
	GO