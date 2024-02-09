export const createUpdateTimestampsFunctionSQL = `
CREATE OR REPLACE FUNCTION update_timestamp() RETURNS TRIGGER
LANGUAGE plpgsql
AS
$$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;
`;

export const createUpdatedAtTriggerSQL = (tableName: string) => `
CREATE TRIGGER update_timestamp
BEFORE UPDATE
ON ${tableName}
FOR EACH ROW
EXECUTE PROCEDURE update_timestamp();
`;

export const dropUpdatedAtTriggerSQL = (tableName: string) => `
DROP TRIGGER update_timestamp ON ${tableName};
`;
