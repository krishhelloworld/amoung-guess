return {
    "nvim-treesitter/nvim-treesitter",
    branch = "main",
    lazy = false,
    build = ":TSUpdate",

    config = function()
        require("nvim-treesitter").setup()

        vim.treesitter.language.register("c", "c")
        vim.treesitter.language.register("cpp", "cpp")
        vim.treesitter.language.register("python", "python")
        vim.treesitter.language.register("javascript", "javascript")
        vim.treesitter.language.register("typescript", "typescript")
    end,
}
