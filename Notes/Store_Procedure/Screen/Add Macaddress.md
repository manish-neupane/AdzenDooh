ALTER TABLE inv.Screen
ADD MacAddress NVARCHAR(17) NULL,
CONSTRAINT UQ_Screen_MacAddress UNIQUE (MacAddress);