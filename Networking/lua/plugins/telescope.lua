return {
    "nvim-telescope/telescope.nvim",

    dependencies = {
        "nvim-lua/plenary.nvim",
    },

    config = function()
        local telescope = require("telescope")
        local builtin = require("telescope.builtin")

        telescope.setup({
            defaults = {
                file_ignore_patterns = {
                    "%.git/",
                    "node_modules/",
                    "%.bun/",
                    "dist/",
                    "build/",
                    "target/",
                    "__pycache__/",
                    "%.venv/",
                    "venv/",
                    "%.cache/",
                },
            },

            pickers = {
                find_files = {
                    hidden = false,
                },

                live_grep = {
                    additional_args = function()
                        return {
                            "--glob", "!**/.git/**",
                            "--glob", "!**/node_modules/**",
                            "--glob", "!**/.bun/**",
                            "--glob", "!**/dist/**",
                            "--glob", "!**/build/**",
                            "--glob", "!**/target/**",
                            "--glob", "!**/__pycache__/**",
                            "--glob", "!**/.venv/**",
                            "--glob", "!**/venv/**",
                            "--glob", "!**/.cache/**",
                        }
                    end,
                },
            },
        })
        vim.keymap.set("n", "<leader>fd", function()
            builtin.find_files({
                find_command = {
                    "fd",
                    "--type", "d",
                    "--hidden",
                    "--exclude", ".git",
                    "--exclude", "node_modules",
                    "--exclude", ".bun",
                    "--exclude", "build",
                    "--exclude", "dist",
                    "--exclude", "target",
                    "--exclude", "__pycache__",
                    "--exclude", ".venv",
                },
            })
        end, {
        desc = "Find Directories",
    })

        vim.keymap.set("n", "<leader>ff", builtin.find_files, {
            desc = "Find Files",
        })

        vim.keymap.set("n", "<leader>fg", builtin.live_grep, {
            desc = "Search Text",
        })
    end,
}
