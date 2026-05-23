import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                system: {
                    background: "var(--system-background)",
                    grouped: "var(--system-grouped-background)",
                    secondary: "var(--system-secondary-grouped-background)",
                    tertiary: "var(--system-tertiary-grouped-background)",
                    blue: "var(--system-blue)",
                    red: "var(--system-red)",
                    green: "var(--system-green)",
                    orange: "var(--system-orange)",
                },
                label: {
                    primary: "var(--label-primary)",
                    secondary: "var(--label-secondary)",
                    tertiary: "var(--label-tertiary)",
                    quaternary: "var(--label-quaternary)",
                },
                separator: {
                    DEFAULT: "var(--separator)",
                    opaque: "var(--separator-opaque)",
                }
            },
            fontFamily: {
                sans: ["-apple-system", "BlinkMacSystemFont", "SF Pro Text", "Helvetica Neue", "sans-serif"],
            },
        },
    },
    plugins: [],
};
export default config;
