module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    rules: {
        'no-console': 'off',
        'no-underscore-dangle': 'off',
        'no-prototype-builtins': 'off',
        'no-plusplus': 'off',
        'spaced-comment': 'off',
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "error",
        "no-useless-constructor": "off",
        "@typescript-eslint/no-useless-constructor": "error",
        'import/no-extraneous-dependencies': 'off',
        'import/no-unresolved': 'off',
        'import/prefer-default-export': 'off',
        'import/extensions': 'off',
        "no-empty-function": "off",
        "@typescript-eslint/no-empty-function": "error",
        "indent": "off",
        "@typescript-eslint/indent": ["error", 4,
            { "SwitchCase": 1 }
        ],
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/no-object-literal-type-assertion": "off",
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/member-delimiter-style": [
            "error",
            {
                "singleline": {
                    "delimiter": "semi",
                    "requireLast": true
                }
            }
        ]
    },
    plugins: [
        "@typescript-eslint",
        "@typescript-eslint/tslint",
    ],
    extends: "airbnb-base",
};