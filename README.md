# markdex

Python Flask + Markdown server

依賴項：Python 3, Flask, markdown

    pip install flask markdown

# 使用方法

首先編輯`config.py`文件。

`root`目錄下存放`.md`文檔。

    python index.py

訪問文檔不需要帶後綴，目錄中如果有`index.md`文件會自動顯示。

自帶列出目錄内容，若被禁止則會顯示403。

# 最後說幾句

- style.css 來自 GitHub Atom 内置的那一套 Markdown 主題。
- favicon.ico 偷的 Ali 的。
