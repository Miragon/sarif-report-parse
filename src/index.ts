import * as core from "@actions/core";
import * as fs from "fs";
import { Log, ReportingDescriptor } from "sarif";

const severities = ["UNKNOWN", "NEGLIGIBLE", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

async function run(): Promise<void> {
    core.startGroup("Reading and parsing input file");

    // 0. Check severity level
    const severityLevelInput = core.getInput("severity-level", { required: false }) ?? "";
    let severityLevel = "HIGH";
    if (severities.find(s => s === severityLevelInput.toUpperCase())) {
        severityLevel = severityLevelInput.toUpperCase();
    }

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
            let severity = infos.get("Severity")?.trim().toUpperCase() ?? "UNKNOWN";
            if (!severities.find(s => s === severity)) {
                severity = "UNKNOWN";
            }

            if (severities.indexOf(severity) >= severities.indexOf(severityLevel)) {
                core.warning(rule.help?.text ?? "", { title: `${severity}: ${rule.shortDescription?.text ?? rule.id}\n` });
            } else {
                // eslint-disable-next-line no-console
                console.log(`${rule.shortDescription?.text ?? rule.id}\n${rule.help?.text ?? ""}\n`);
            }
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
