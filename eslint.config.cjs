const js = require("@eslint/js");
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const importPlugin = require("eslint-plugin-import");

module.exports = [
    {
        ignores: ["dist/**", "lib/**", "node_modules/**"],
        languageOptions: {
            globals: {
                __dirname: "readonly",
                console: "readonly",
                module: "readonly",
                process: "readonly",
                require: "readonly"
            }
        }
    },
    js.configs.recommended,
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            parser: tsParser,
            globals: {
                console: "readonly",
                process: "readonly"
            }
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
            import: importPlugin
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            "no-undef": "off",
            "@typescript-eslint/no-unused-expressions": [
                "error",
                {
                    allowShortCircuit: true,
                    allowTernary: true
                }
            ],
            "object-shorthand": [
                "error",
                "consistent-as-needed"
            ],
            "no-param-reassign": [
                "error",
                {
                    props: true,
                    ignorePropertyModificationsFor: [
                        "draft"
                    ]
                }
            ],
            "arrow-body-style": "off",
            "arrow-parens": [
                "error",
                "as-needed"
            ],
            "linebreak-style": "off",
            "radix": [
                "error",
                "as-needed"
            ],
            "object-curly-newline": [
                "error",
                {
                    ImportDeclaration: {
                        multiline: true
                    }
                }
            ],
            "no-restricted-syntax": [
                "error",
                "ForInStatement",
                "LabeledStatement",
                "WithStatement"
            ],
            "@typescript-eslint/no-non-null-assertion": "off",
            "no-await-in-loop": "off",
            "prefer-destructuring": "off",
            "import/prefer-default-export": "off",
            "class-methods-use-this": "off"
        }
    }
];
