# markdex

Python Flask + Markdown server

依賴項：Python 3, Flask, markdown

    pip3 install flask markdown

# 使用方法

首先編輯`config.py`文件（裏面有注釋！）

`root`目錄下存放`.md`文檔。

    python3 index.py

訪問文檔不需要帶後綴，目錄中如果有`index.md`文件會自動顯示。

自帶列出目錄内容，若被禁止則會顯示403。

# 編輯器

在`auth_credentials`文件中指定管理員用戶名和長md5(密碼)。

（默認的這個是`admin`和`123456`

登入地址是`/__login__`，編輯器地址是`/__editor__`。

還有很多東西沒有弄，點擊`RM`刪除文件之前請三思！

# 最後說幾句

- style.css 來自 GitHub Atom 内置的那一套 Markdown 主題。
- favicon.ico 偷的 Ali 的。
