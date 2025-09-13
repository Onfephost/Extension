(function (Scratch) {
  let lastStatus = "", encodeMode = true;
  let dangerousBlocksHidden = false;

  class GitPenguin {
    getInfo() {
      return {
        id: "gitpenguin",
        name: "GitHub File Extension",
        color1: "#303030",
        color2: "#212121",
        color3: "#212121",
        blocks: [
          { blockType: Scratch.BlockType.LABEL, text: "Get" },
          {
            opcode: "getFileContents",
            blockType: Scratch.BlockType.REPORTER,
            text: "get contents of file [FILE] from repository [REPO] of user [NAME]",
            arguments: {
              FILE: { type: Scratch.ArgumentType.STRING, defaultValue: "README.md" },
              REPO: { type: Scratch.ArgumentType.STRING, defaultValue: "repository" },
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "username" }
            }
          },
          {
            opcode: "getStatus",
            blockType: Scratch.BlockType.REPORTER,
            text: "recent file status"
          },
          {
            opcode: "toggleEncode",
            blockType: Scratch.BlockType.COMMAND,
            text: "toggle file encoding [TYPE]",
            arguments: { TYPE: { type: Scratch.ArgumentType.STRING, menu: "TOGGLE" } }
          },
          ...(dangerousBlocksHidden ? ["---"] : []),
          { blockType: Scratch.BlockType.LABEL, text: "File Control", hideFromPalette: dangerousBlocksHidden },
          {
            blockType: Scratch.BlockType.BUTTON,
            hideFromPalette: !dangerousBlocksHidden,
            func: "showDangerousBlocks",
            text: Scratch.translate("Show Potentially Dangerous Blocks")
          },
          {
            hideFromPalette: dangerousBlocksHidden,
            opcode: "createFile",
            blockType: Scratch.BlockType.COMMAND,
            text: "create file [FILE] with content [CONTENT] in repository [REPO] of user [NAME] using token [TOKEN]",
            arguments: {
              FILE: { type: Scratch.ArgumentType.STRING, defaultValue: "newFile.txt" },
              CONTENT: { type: Scratch.ArgumentType.STRING, defaultValue: "Hello, world!" },
              REPO: { type: Scratch.ArgumentType.STRING, defaultValue: "repository" },
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "username" },
              TOKEN: { type: Scratch.ArgumentType.STRING, defaultValue: "YOUR_GITHUB_TOKEN" }
            }
          },
          {
            hideFromPalette: dangerousBlocksHidden,
            opcode: "editFileContent",
            blockType: Scratch.BlockType.COMMAND,
            text: "edit content of file [FILE] in repository [REPO] of user [NAME] to [CONTENT] using token [TOKEN]",
            arguments: {
              FILE: { type: Scratch.ArgumentType.STRING, defaultValue: "newFile.txt" },
              CONTENT: { type: Scratch.ArgumentType.STRING, defaultValue: "Hello, world!" },
              REPO: { type: Scratch.ArgumentType.STRING, defaultValue: "repository" },
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "username" },
              TOKEN: { type: Scratch.ArgumentType.STRING, defaultValue: "YOUR_GITHUB_TOKEN" }
            }
          },
          {
            hideFromPalette: dangerousBlocksHidden,
            opcode: "deleteFile",
            blockType: Scratch.BlockType.COMMAND,
            text: "delete file [FILE] from repository [REPO] of user [NAME] using token [TOKEN]",
            arguments: {
              FILE: { type: Scratch.ArgumentType.STRING, defaultValue: "newFile.txt" },
              REPO: { type: Scratch.ArgumentType.STRING, defaultValue: "repository" },
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "username" },
              TOKEN: { type: Scratch.ArgumentType.STRING, defaultValue: "YOUR_GITHUB_TOKEN" }
            }
          },
        ],
        menus: { TOGGLE: ["on", "off"] }
      };
    }

    showDangerousBlocks() {
      const confirmationText = "I understand these blocks could compromise my account";
      ScratchBlocks.prompt(
        `WARNING: Anyone who has access to your GitHub token has control of your GitHub account. Depending on the access you gave your token, anyone can perform actions that can be used in a malicious way as if they were you. Never share your token in a public project. To reveal these blocks, type: '${confirmationText}'`,
        "",
        (answer) => {
          if (answer.toLowerCase() !== confirmationText.toLowerCase()) {
            if (answer) alert("Prompt answered incorrectly!");
            return;
          }
          dangerousBlocksHidden = false;
          Scratch.vm.extensionManager.refreshBlocks("gitpenguin");
        },
        "Danger Notice", "broadcast_msg"
      );
    }

    // ✅ Gelişmiş MIME destekli getFileContents
    async getFileContents({ FILE, REPO, NAME }) {
      const apiUrl = `https://api.github.com/repos/${NAME}/${REPO}/contents/${FILE}`;
      const response = await Scratch.fetch(apiUrl);
      const data = await response.json();
      lastStatus = response.status;
      if (response.ok) {
        // Varsayılan MIME
        let mime = "application/octet-stream";
        const ext = FILE.split('.').pop().toLowerCase();

        const mimeTypes = {
          "txt": "text/plain",
          "md": "text/markdown",
          "json": "application/json",
          "html": "text/html",
          "htm": "text/html",
          "css": "text/css",
          "js": "application/javascript",
          "xml": "application/xml",
          "csv": "text/csv",
          "tsv": "text/tab-separated-values",

          // Görseller
          "png": "image/png",
          "jpg": "image/jpeg",
          "jpeg": "image/jpeg",
          "gif": "image/gif",
          "bmp": "image/bmp",
          "webp": "image/webp",
          "svg": "image/svg+xml",
          "ico": "image/x-icon",

          // Ses
          "mp3": "audio/mpeg",
          "wav": "audio/wav",
          "ogg": "audio/ogg",
          "m4a": "audio/mp4",
          "flac": "audio/flac",
          "aac": "audio/aac",

          // Video
          "mp4": "video/mp4",
          "webm": "video/webm",
          "oggv": "video/ogg",
          "mov": "video/quicktime",
          "avi": "video/x-msvideo",
          "mkv": "video/x-matroska",

          // Belgeler
          "pdf": "application/pdf",
          "doc": "application/msword",
          "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "ppt": "application/vnd.ms-powerpoint",
          "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "xls": "application/vnd.ms-excel",
          "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

          // Arşivler
          "zip": "application/zip",
          "rar": "application/vnd.rar",
          "7z": "application/x-7z-compressed",
          "tar": "application/x-tar",
          "gz": "application/gzip"
        };

        if (mimeTypes[ext]) mime = mimeTypes[ext];

        // ✅ data URL döndür
        return `data:${mime};base64,${data.content}`;
      } else {
        return '';
      }
    }

    async createFile({ FILE, CONTENT, REPO, NAME, TOKEN }) {
      const apiUrl = `https://api.github.com/repos/${NAME}/${REPO}/contents/${FILE}`;
      const requestBody = JSON.stringify({
        message: `Create ${FILE}`,
        content: encodeMode ? btoa(CONTENT) : CONTENT
      });
      const response = await Scratch.fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${TOKEN}`
        },
        body: requestBody
      });
      lastStatus = response.status;
    }

    async editFileContent({ FILE, CONTENT, REPO, NAME, TOKEN }) {
      const apiUrl = `https://api.github.com/repos/${NAME}/${REPO}/contents/${FILE}`;
      const getResponse = await Scratch.fetch(apiUrl, {
        headers: { 'Authorization': `token ${TOKEN}` }
      });
      lastStatus = getResponse.status;
      if (!getResponse.ok) return;
      const fileData = await getResponse.json();
      const putResponse = await Scratch.fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${TOKEN}`
        },
        body: JSON.stringify({
          message: `Edit ${FILE}`,
          content: encodeMode ? btoa(CONTENT) : CONTENT,
          sha: fileData.sha
        })
      });
      lastStatus = putResponse.status;
    }

    async deleteFile({ FILE, REPO, NAME, TOKEN }) {
      const apiUrl = `https://api.github.com/repos/${NAME}/${REPO}/contents/${FILE}`;
      const getResponse = await Scratch.fetch(apiUrl, {
        headers: { 'Authorization': `token ${TOKEN}` }
      });
      if (!getResponse.ok) return;
      const fileData = await getResponse.json();
      const deleteResponse = await Scratch.fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${TOKEN}`
        },
        body: JSON.stringify({ message: `Delete ${FILE}`, sha: fileData.sha })
      });
      lastStatus = deleteResponse.status;
    }

    toggleEncode(args) { encodeMode = args.TYPE === "on"; }
    getStatus() { return lastStatus; }
  }

  Scratch.extensions.register(new GitPenguin());
})(Scratch);
