"
" ~/.vimrc
"
" This is your Vim initialization file. It is read on Vim startup.
"
" Change this file to customize your Vim settings.
" 
" Vim treats lines beginning with " as comments.
"
" EXAMPLES are available in /usr/local/doc/startups.
"

" Use Vim settings, rather then Vi settings (much better!).
" This must be first, because it changes other options as a side effect.
set nocompatible

" allow backspacing over everything in insert mode
set backspace=indent,eol,start

" Vim5 and later versions support syntax highlighting. Uncommenting the next
" line enables syntax highlighting by default.
syntax on

" If using a dark background within the editing area and syntax highlighting
" turn on this option as well
"set background=dark

" Have Vim jump to the last position when reopening a file
if has("autocmd")
  au BufReadPost * if line("'\"") > 0 && line("'\"") <= line("$")
    \| exe "normal g'\"" | endif
endif

" Have Vim load indentation rules according to the detected filetype.
if has("autocmd")
  filetype indent on
endif

set showcmd            " Show (partial) command in status line.
set showmatch          " Show matching brackets.
set ignorecase         " Do case insensitive matching
set smartcase          " Do smart case matching
set incsearch          " Incremental search
set autowrite          " Automatically save before commands like :next and :make
set hidden             " Hide buffers when they are abandoned
set mouse=a            " Enable mouse usage (all modes) in terminals
set nu		       " Line numbers on (vh)
set clipboard=unnamed

set expandtab tabstop=4 softtabstop=4 shiftwidth=4
" Set tab preferences for files identified as python.
au fileType python setlocal tabstop=8 expandtab shiftwidth=4 softtabstop=4
" Set tab prefs for files identified as javascript.
au fileType javascript setlocal tabstop=2 expandtab shiftwidth=2 softtabstop=2
" Set tab prefs for files identified as json.
au fileType json setlocal tabstop=4 expandtab shiftwidth=4 softtabstop=4
" tab prefs for html
au fileType html setlocal tabstop=2 softtabstop=2 shiftwidth=2
" tab prefs for css
au fileType css setlocal tabstop=2 softtabstop=2 shiftwidth=2
