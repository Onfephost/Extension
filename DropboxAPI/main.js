(function (Scratch) {
  let lastStatus = "";
  let accessToken = "";
  let Token = false;
  class DropboxExtension {
    getInfo() {
      return {
        id: "dropboxapi",
        name: "DropBox API",
        color1: "#0061FF",
        color2: "#0046B7",
        color3: "#003699",
        blocks: [
          {
            opcode: "setToken",
            blockType: Scratch.BlockType.COMMAND,
            text: "Set Dropbox token [TOKEN]",
            arguments: {
              TOKEN: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "DROPBOX_ACCESS_TOKEN"
              }
            }
          },
          { blockType: Scratch.BlockType.LABEL, text: "File Control" },
          {
            opcode: "getFileContents",
            blockType: Scratch.BlockType.REPORTER,
            text: "Get contents of [FILE]",
            arguments: {
              FILE: { type: Scratch.ArgumentType.STRING, defaultValue: "/test.txt" }
            }
          },
          {
            opcode: "createFile",
            blockType: Scratch.BlockType.COMMAND,
            text: "Create file [FILE] with content [CONTENT]",
            arguments: {
              FILE: { type: Scratch.ArgumentType.STRING, defaultValue: "/newFile.txt" },
              CONTENT: { type: Scratch.ArgumentType.STRING, defaultValue: "Hello, Dropbox!" }
            }
          },
          {
            opcode: "editFileContent",
            blockType: Scratch.BlockType.COMMAND,
            text: "Edit file [FILE] to [CONTENT]",
            arguments: {
              FILE: { type: Scratch.ArgumentType.STRING, defaultValue: "/newFile.txt" },
              CONTENT: { type: Scratch.ArgumentType.STRING, defaultValue: "Updated text" }
            }
          },
          {
            opcode: "deleteFile",
            blockType: Scratch.BlockType.COMMAND,
            text: "Delete file [FILE]",
            arguments: {
              FILE: { type: Scratch.ArgumentType.STRING, defaultValue: "/newFile.txt" }
            }
          },
          {
            opcode: "getStatus",
            blockType: Scratch.BlockType.REPORTER,
            text: "recent request status"
          }
        ]
      };
    }

    setToken({ TOKEN }) {
      accessToken = TOKEN;
      Token = true;  
    }

    async getFileContents({ FILE }) {
      const url = "https://content.dropboxapi.com/2/files/download";
      const response = await Scratch.fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Dropbox-API-Arg": `{"path": "${FILE}"}`
        }
      });
      lastStatus = response.status;
      if (!response.ok) return "";
      return await response.text();
    }

    async createFile({ FILE, CONTENT }) {
      const url = "https://content.dropboxapi.com/2/files/upload";
      const response = await Scratch.fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/octet-stream",
          "Dropbox-API-Arg": `{"path": "${FILE}","mode": "add","autorename": true,"mute": false}`
        },
        body: new TextEncoder().encode(CONTENT)
      });
      lastStatus = response.status;
    }

    async editFileContent({ FILE, CONTENT }) {
      const url = "https://content.dropboxapi.com/2/files/upload";
      const response = await Scratch.fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/octet-stream",
          "Dropbox-API-Arg": `{"path": "${FILE}","mode": "overwrite","autorename": false,"mute": false}`
        },
        body: new TextEncoder().encode(CONTENT)
      });
      lastStatus = response.status;
    }

    async deleteFile({ FILE }) {
      const url = "https://api.dropboxapi.com/2/files/delete_v2";
      const response = await Scratch.fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ path: FILE })
      });
      lastStatus = response.status;
    }

    getStatus() {
      return lastStatus;
    }
  }

  Scratch.extensions.register(new DropboxExtension());
})(Scratch);

