# Sarif Report Parse

> **Maintenance mode:** This action only receives security fixes and Node.js runtime updates. No new features are planned.

If you'd like to see [Anchore Scan Action](https://github.com/anchore/scan-action)'s result, you could either upgrade your Github plan to Enterpise and activate Automated Code Scanning (ACS) or you use this action:
![Action Result](docs/img/action-result-screenshot.png)

## Usage

Just include the action in your workflow like this:

```yaml
jobs:
  docker:
    timeout-minutes: 15
    runs-on: ubuntu-latest
    steps:
      - name: Login to GCR
        uses: docker/login-action@v1
        with:
          registry: eu.gcr.io
          username: _json_key
          password: ${{ secrets.GCR_JSON_KEY }}
      - name: Scan image
        id: scan
        uses: anchore/scan-action@v3
        with:
          image: ${IMAGE_NAME}
          fail-build: false
          debug: false
          acs-report-enable: true
      - name: Parse SARIF file
        uses: Miragon/sarif-report-parse@v1.0.5
        with:
          sarif-file: ${{ steps.scan.outputs.sarif }}
```

## Supported tools

The action reads the severity from the `Severity: X` line in each rule's `help.text`. This works for:

- [Anchore/Grype](https://github.com/anchore/scan-action)
- [Trivy](https://github.com/aquasecurity/trivy): vulnerabilities, misconfigurations and secrets

Not supported:

- Trivy license findings, which have no severity and are only logged
- tflint, which reports severity only in `result.level`, so nothing gets annotated

The action evaluates rules, not results, so annotations carry no file or line, and each finding appears once regardless of how many locations it affects.

## Contributing

We are always welcoming new contributors that are helping to improve this action.

The [Open Source Guides](https://opensource.guide/) website has a lot of information for people and companies who are 
interested in how to run and contribute to an open source project. Contributors and people new to open source will find 
[this guide on how to contribute to Open Source](https://opensource.guide/how-to-contribute/) especially helpful.

There are many ways in which you can contribute to this repository, and not all of them require you to write code:

- **Use the action!** Test the action, check if edge cases are breaking them, and open issues if anything does not work 
  as expected or could be improved. Send us your feedback.
- **Read our documentation.** Is everything covered or are there any missing parts? Is there anything left unclear?
  Open an issue if anything is missing or wrong.
- **Check our open issues.** If there is any issue you would like to work on, feel free to fork the repository and 
  submit a pull request. If you need help, let us know, we're here to help.
  
## Development Notice

Run `yarn build && yarn dist && yarn test`. `yarn dist` runs ESLint and bundles the action into `dist/`, which must be
committed. The tests run against that bundle. To release, bump `version` in `package.json` and start the Release workflow.

### Maintenance

Renovate opens updates on the 1st of each month. CI builds `dist/`, fails if the committed bundle is outdated, and runs
the tests against it.

| When | What to do |
| --- | --- |
| Monthly Renovate PRs | Review and merge once CI is green. |
| Security PR (`[SECURITY]`) | Merge right away, Renovate skips the schedule for these. |
| CI fails at "Ensure dist is committed" | The bundle changed, so users only get it with a release. On the PR branch, run `yarn dist`, bump the patch `version` in `package.json`, commit and push. After merging, start the Release workflow. If several PRs change `dist/` in one month, bump and release once. |
| GitHub supports a newer Node.js runtime for actions | Update `runs.using` in `action.yml`, `.nvmrc`, `--target` in the `dist` script and the `24.x` rules in `renovate.json`, then release a major version. |
| typescript-eslint supports TypeScript 7 | Remove the `typescript` `<7` rule from `renovate.json`. |

## License

Distributed under the Apache 2.0 License.

```
Copyright 2022 Miragon GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
