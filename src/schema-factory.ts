import * as fs from "fs"
import * as path from "path"

export function createSuperGraphSdl(): string {
    const schemaFilePath: string = path.join(__dirname, "..", "./src/rover/schema.graphql");
    return fs.readFileSync(schemaFilePath, "utf8");
}
