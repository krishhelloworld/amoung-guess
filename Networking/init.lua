-- ========================================
-- Neovim Configuration
-- ========================================

-- Leader key
vim.g.mapleader = " "
vim.g.maplocalleader = " "


-- Line numbers
vim.opt.number = true
vim.opt.relativenumber = true

-- Indentation
vim.opt.expandtab = true
vim.opt.shiftwidth = 4
vim.opt.tabstop = 4
vim.opt.smartindent = true

-- Search
vim.opt.ignorecase = true
vim.opt.smartcase = true

-- UI
vim.opt.termguicolors = true
vim.opt.cursorline = true
vim.opt.signcolumn = "yes"

-- Better editing
vim.opt.mouse = "a"
vim.opt.clipboard = "unnamedplus"


-- REFRESH THE PAGE OF FILES
vim.opt.autoread = true


-- AUTOMATICALLY COMPILE AND RUN THE CPP FILE 
vim.keymap.set("n", "<F6>", ":w<CR>:botright split | terminal g++ % -o %:r.exe && %:r.exe<CR>")


-- AUTOMATICALLY  OPEN THE RECENT CLOSED SESSIONS
vim.keymap.set("n", "<leader>ss", ":mksession! mysession.vim<CR>")
vim.keymap.set("n", "<leader>sr", ":source mysession.vim<CR>")
vim.api.nvim_create_autocmd({ "FocusGained", "BufEnter" }, {
  command = "checktime",
})


-- Switch between buffers 
vim.keymap.set("n", "<leader>bn", ":enew<CR>")
vim.keymap.set("n", "<leader>bd", ":bd<CR>")
vim.keymap.set("n", "<leader>,", ":bn<CR>", { desc = "Next buffer" })
vim.keymap.set("n", "<leader>.", ":bp<CR>", { desc = "Previous buffer" })-- Don't show mode twice


-- AUTOSESSIONS  
vim.api.nvim_create_user_command("Ar", "AutoSession restore", {})
vim.api.nvim_create_user_command("As", "AutoSession search", {})

vim.opt.showmode = false
-- vim keymap for back to editing to file manager 
-- vim.keymap.set("n", "-", "")
-- ========================================
-- Plugin Manager: lazy.nvim
-- ========================================

local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"

if not vim.loop.fs_stat(lazypath) then
    vim.fn.system({
        "git",
        "clone",
        "--filter=blob:none",
        "https://github.com/folke/lazy.nvim.git",
        "--branch=stable",
        lazypath,
    })
end

vim.opt.rtp:prepend(lazypath)


require("lazy").setup({
    { import = "plugins" },
})
