import * as core from "@actions/core";
import * as fs from "fs";
import { Log, ReportingDescriptor } from "sarif";

async function run(): Promise<void> {
    core.startGroup("Reading and parsing input file");

    // 1. Read file
    let file: string;
    try {
        const sarifFile = core.getInput("sarif-file", { required: true });
        file = fs.readFileSync(sarifFile, "utf8");
    } catch (e) {
        core.endGroup();
        throw new Error(`Could not read file: ${e instanceof Error ? e.message : ""}`);
    }

    // 2. Parse file
    let parsedFile: Log;
    try {
        parsedFile = JSON.parse(file);
    } catch (e) {
        core.endGroup();
        throw new Error(`Could not parse file: ${e instanceof Error ? e.message : ""}`);
    }

    // 3. Log severities
    parsedFile.runs
        .map(sarifRun => sarifRun.tool.driver.rules)
        .flat()
        .filter((rules): rules is ReportingDescriptor => !!rules)
        .forEach(rule => {
            const infos: Map<string, string> = new Map();
            rule.help?.text.split("\n")
                .map(infoRow => infoRow.split(":"))
                .forEach(tupel => infos.set(tupel[0], tupel[1]));
            const severity = infos.get("Severity")?.trim().toUpperCase();
            core.warning(rule.help?.text ?? "", { title: `${severity ?? "UNKNOWN"}: ${rule.fullDescription?.text ?? rule.id}` });
        });

    core.endGroup();
}

const asyncRun = async (): Promise<void> => {
    try {
        await run();
    } catch (e) {
        core.setFailed(e instanceof Error ? e.message : "Execution failed");
    }
};

asyncRun();
