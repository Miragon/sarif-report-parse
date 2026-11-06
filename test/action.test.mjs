import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

// Runs the bundled dist/ exactly as GitHub does, with inputs passed as INPUT_* env vars.
function runAction(inputs) {
    const env = { ...process.env };
    for (const [name, value] of Object.entries(inputs)) {
        env[`INPUT_${name.toUpperCase()}`] = value;
    }
    const stdout = execFileSync("node", ["dist/index.js"], { env, encoding: "utf8" });
    return stdout.split("\n").filter(line => line.startsWith("::warning")).map(line => line.match(/title=(\w+)%3A/)?.[1]);
}

test("trivy report: warns from HIGH upwards by default", () => {
    assert.deepEqual(runAction({ "sarif-file": "test/fixtures/trivy.sarif" }).sort(), ["CRITICAL", "HIGH", "HIGH"]);
});

test("trivy report: severity-level lowers the threshold", () => {
    const warnings = runAction({ "sarif-file": "test/fixtures/trivy.sarif", "severity-level": "medium" });
    assert.equal(warnings.length, 5);
});

test("unknown severity-level falls back to HIGH", () => {
    const warnings = runAction({ "sarif-file": "test/fixtures/trivy.sarif", "severity-level": "nonsense" });
    assert.equal(warnings.length, 3);
});

test("missing file produces a warning instead of failing", () => {
    const env = { ...process.env, "INPUT_SARIF-FILE": "does/not/exist.sarif" };
    const stdout = execFileSync("node", ["dist/index.js"], { env, encoding: "utf8" });
    assert.match(stdout, /::warning::PARSING REPORT FAILED: Could not read file/);
});
