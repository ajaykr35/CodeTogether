// frontend/src/components/FileExplorer.jsx
// Left side ka file explorer: files aur folders ka tree.
// Naya file ya folder banana, naam badalna (rename), folder kholna ya band karna, delete karna.
// Path "/" se bante hain: "src/utils/helper.py"

import { useState } from "react";
import { getFileType } from "../utils/languages.js";

const INVALID_CHARS = /[\\:*?"<>|]/;
const MAX_DEPTH = 6; // folders ki sabse zyada gehrai (file ka naam milakar)

// "src/utils/a.py" -> "src/utils"   |   "a.py" -> ""
function parentOf(path) {
  const index = path.lastIndexOf("/");
  return index === -1 ? "" : path.slice(0, index);
}

// Agar "src" folder pehle se hai aur user "SRC/a.py" likhe, to "src/a.py" banana
// (taaki ek hi folder ke do alag spelling na ban jayein)
function normalizePath(path, folders) {
  const parts = path.split("/");
  const result = [];

  for (let i = 0; i < parts.length - 1; i++) {
    const prefix = [...result, parts[i]].join("/");
    const match = folders.find((folder) => folder.toLowerCase() === prefix.toLowerCase());
    result.push(match ? match.split("/").pop() : parts[i]);
  }

  result.push(parts[parts.length - 1]);
  return result.join("/");
}

// Naya file ya folder banate waqt naam sahi hai ya nahi, check karta hai.
// Return: { error: "text ya khali", path: "poora path" }
function validatePath(rawName, parent, files, folders) {
  const name = rawName.trim();

  if (!name) return { error: "Enter a name.", path: "" };
  if (name.length > 80) return { error: "Name can be at most 80 characters.", path: "" };
  if (INVALID_CHARS.test(name)) {
    return { error: 'Name cannot contain \\ : * ? " < > |', path: "" };
  }
  if (name.startsWith("/") || name.endsWith("/") || name.includes("//")) {
    return { error: "Use names like src/main.py. Do not start or end with /.", path: "" };
  }
  if (name.split("/").some((part) => part === "." || part === "..")) {
    return { error: 'Names cannot be "." or "..".', path: "" };
  }

  const full = normalizePath(parent ? `${parent}/${name}` : name, folders);
  const lower = full.toLowerCase();
  const parts = full.split("/");

  if (parts.length > MAX_DEPTH) {
    return { error: `Folders can be at most ${MAX_DEPTH} levels deep.`, path: "" };
  }

  if (files.some((f) => f.toLowerCase() === lower) || folders.some((f) => f.toLowerCase() === lower)) {
    return { error: "A file or folder with this name already exists.", path: "" };
  }

  // Koi file ke andar folder ya file nahi ban sakti: "a.py" file hai to "a.py/b.py" nahi
  for (let i = 1; i < parts.length; i++) {
    const prefix = parts.slice(0, i).join("/");
    if (files.some((f) => f.toLowerCase() === prefix.toLowerCase())) {
      return { error: `"${prefix}" is a file, so it cannot contain other items.`, path: "" };
    }
  }

  return { error: "", path: full };
}

// Rename ke waqt naya naam sahi hai ya nahi, check karta hai.
// Naam usi folder mein rehta hai, isliye "/" allowed nahi.
// Return: { error: "text ya khali", path: "naya poora path" }
function validateRename(rawName, oldPath, files, folders) {
  const name = rawName.trim();
  const oldName = oldPath.split("/").pop();

  if (!name) return { error: "Enter a name.", path: "" };
  if (name === oldName) return { error: "", path: oldPath }; // koi badlav nahi
  if (name.length > 80) return { error: "Name can be at most 80 characters.", path: "" };
  if (INVALID_CHARS.test(name)) {
    return { error: 'Name cannot contain \\ : * ? " < > |', path: "" };
  }
  if (name.includes("/")) {
    return { error: "The name cannot contain /. Moving items is not supported yet.", path: "" };
  }
  if (name === "." || name === "..") {
    return { error: 'Name cannot be "." or "..".', path: "" };
  }

  const parent = parentOf(oldPath);
  const newPath = parent ? `${parent}/${name}` : name;
  const lower = newPath.toLowerCase();

  // Khud ke alawa koi aur file ya folder isi naam ka na ho
  const clash = [...files, ...folders].some(
    (item) => item !== oldPath && item.toLowerCase() === lower
  );
  if (clash) {
    return { error: "A file or folder with this name already exists here.", path: "" };
  }

  return { error: "", path: newPath };
}

// oldPath ka shuruaati hissa newPath se badalta hai.
// Jaise folder "src" ko "app" karne par "src/a.py" -> "app/a.py"
function renamePrefix(path, oldPath, newPath) {
  if (path === oldPath) return newPath;
  if (path.startsWith(`${oldPath}/`)) return newPath + path.slice(oldPath.length);
  return path;
}

// Paths ki flat list se nested tree banata hai
function buildTree(files, folders) {
  const root = { folders: {}, files: [] };

  // parts (["src", "utils"]) ke hisaab se node tak pahunchta hai, jo nahi hai use banata hai
  const getNode = (parts) => {
    let node = root;
    parts.forEach((part) => {
      if (!node.folders[part]) node.folders[part] = { folders: {}, files: [] };
      node = node.folders[part];
    });
    return node;
  };

  folders.forEach((folder) => getNode(folder.split("/")));
  files.forEach((path) => {
    const parts = path.split("/");
    const name = parts.pop();
    getNode(parts).files.push({ name, path });
  });

  return root;
}

// Rename ke waqt row mein dikhne wala input box
function RenameInput({ ctx, indent }) {
  const isFile = ctx.renaming.kind === "file";

  return (
    <form className="ws-rename" style={{ paddingLeft: indent }} onSubmit={ctx.submitRename} noValidate>
      <input
        autoFocus
        value={ctx.renameValue}
        onChange={(e) => ctx.changeRename(e.target.value)}
        onFocus={(e) => {
          // File ho to extension chhodkar sirf naam select karo: "main|.py"
          const dot = e.target.value.lastIndexOf(".");
          e.target.setSelectionRange(0, isFile && dot > 0 ? dot : e.target.value.length);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") ctx.cancelRename();
        }}
        onBlur={ctx.cancelRename}
        aria-label={`New name for ${ctx.renaming.path}`}
        className={ctx.renameError ? "ws-rename-input has-error" : "ws-rename-input"}
      />
      {ctx.renameError && <span className="ws-newfile-error">{ctx.renameError}</span>}
    </form>
  );
}

// Pencil icon (rename)
function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

// Ek level ke folders aur files dikhata hai (folder ke andar ye khud ko dobara bulata hai)
function TreeLevel({ node, parentPath, depth, ctx }) {
  const folderNames = Object.keys(node.folders).sort((a, b) => a.localeCompare(b));
  const fileItems = [...node.files].sort((a, b) => a.name.localeCompare(b.name));
  const indent = 8 + depth * 14;

  return (
    <>
      {/* Pehle folders */}
      {folderNames.map((name) => {
        const path = parentPath ? `${parentPath}/${name}` : name;
        const child = node.folders[name];
        const isCollapsed = ctx.collapsed.includes(path);
        const isEmpty = Object.keys(child.folders).length === 0 && child.files.length === 0;
        const isRenaming = ctx.renaming && ctx.renaming.path === path;

        return (
          <li key={path} role="treeitem" aria-expanded={!isCollapsed}>
            <div className={path === ctx.selectedFolder ? "ws-row folder selected" : "ws-row folder"}>
              {isRenaming ? (
                <RenameInput ctx={ctx} indent={indent} />
              ) : (
                <>
                  <button
                    type="button"
                    className="ws-row-btn"
                    style={{ paddingLeft: indent }}
                    onClick={() => ctx.clickFolder(path)}
                    onKeyDown={(e) => {
                      if (e.key === "F2") {
                        e.preventDefault();
                        ctx.startRename(path, "folder");
                      }
                    }}
                  >
                    <span className="ws-chevron" aria-hidden="true">
                      {isCollapsed ? "\u25B8" : "\u25BE"}
                    </span>
                    <span className="ws-row-name">{name}</span>
                  </button>

                  {/* Is folder ke icons: naya file, naya folder, rename */}
                  <span className="ws-row-tools">
                    <button
                      type="button"
                      className="ws-row-add"
                      onClick={() => ctx.newInFolder(path, "file")}
                      aria-label={`New file in ${path}`}
                      title="New file here"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="ws-row-add"
                      onClick={() => ctx.newInFolder(path, "folder")}
                      aria-label={`New folder in ${path}`}
                      title="New folder here"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        <line x1="12" y1="11" x2="12" y2="17" />
                        <line x1="9" y1="14" x2="15" y2="14" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="ws-row-add"
                      onClick={() => ctx.startRename(path, "folder")}
                      aria-label={`Rename folder ${path}`}
                      title="Rename (F2)"
                    >
                      <PencilIcon />
                    </button>
                  </span>

                  <button
                    type="button"
                    className="ws-file-delete"
                    onClick={() => ctx.deleteFolder(path)}
                    aria-label={`Delete folder ${path}`}
                    title="Delete folder"
                  >
                    &times;
                  </button>
                </>
              )}
            </div>

            {!isCollapsed && (
              <ul role="group" className="ws-tree">
                {isEmpty ? (
                  <li className="ws-tree-empty" style={{ paddingLeft: indent + 22 }}>
                    Empty folder
                  </li>
                ) : (
                  <TreeLevel node={child} parentPath={path} depth={depth + 1} ctx={ctx} />
                )}
              </ul>
            )}
          </li>
        );
      })}

      {/* Phir files (yahan variable ka naam file.path hai, path nahi) */}
      {fileItems.map((file) => {
        const isRenaming = ctx.renaming && ctx.renaming.path === file.path;

        return (
          <li key={file.path} role="treeitem">
            <div className={file.path === ctx.activeFile ? "ws-row active" : "ws-row"}>
              {isRenaming ? (
                <RenameInput ctx={ctx} indent={indent + 18} />
              ) : (
                <>
                  <button
                    type="button"
                    className="ws-row-btn"
                    style={{ paddingLeft: indent + 18 }}
                    onClick={() => ctx.openFile(file.path)}
                    onKeyDown={(e) => {
                      if (e.key === "F2") {
                        e.preventDefault();
                        ctx.startRename(file.path, "file");
                      }
                    }}
                  >
                    <span className="ws-row-name">{file.name}</span>
                    <span className="ws-file-lang">{getFileType(file.name).label}</span>
                  </button>

                  <span className="ws-row-tools">
                    <button
                      type="button"
                      className="ws-row-add"
                      onClick={() => ctx.startRename(file.path, "file")}
                      aria-label={`Rename ${file.path}`}
                      title="Rename (F2)"
                    >
                      <PencilIcon />
                    </button>
                  </span>

                  <button
                    type="button"
                    className="ws-file-delete"
                    onClick={() => ctx.deleteFile(file.path)}
                    aria-label={`Delete ${file.path}`}
                    title="Delete file"
                  >
                    &times;
                  </button>
                </>
              )}
            </div>
          </li>
        );
      })}
    </>
  );
}

function FileExplorer({
  files,
  folders,
  activeFile,
  creating, // null, "file" ya "folder"
  setCreating,
  onAddFile,
  onAddFolder,
  onOpen,
  onDeleteFile,
  onDeleteFolder,
  onRenameFile,
  onRenameFolder,
}) {
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [selectedFolder, setSelectedFolder] = useState(""); // "" = project root
  const [collapsed, setCollapsed] = useState([]); // jo folders band hain

  // Rename ki state: kaunsa item aur uska naya naam
  const [renaming, setRenaming] = useState(null); // null ya { path, kind }
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState("");

  // Path ke saare folders ko khol deta hai (naya item dikhe isliye)
  const expandPath = (path) => {
    setCollapsed((list) => list.filter((p) => path !== p && !path.startsWith(`${p}/`)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validatePath(newName, selectedFolder, files, folders);
    setError(result.error);
    if (result.error) return;

    if (creating === "folder") onAddFolder(result.path);
    else onAddFile(result.path);

    expandPath(result.path);
    setNewName("");
    setCreating(null);
  };

  const handleCancel = () => {
    setNewName("");
    setError("");
    setCreating(null);
  };

  const startCreating = (kind) => {
    setRenaming(null);
    setNewName("");
    setError("");
    setCreating(kind);
  };

  // Rename band karna (Esc, ya input se bahar click)
  const cancelRename = () => {
    setRenaming(null);
    setRenameValue("");
    setRenameError("");
  };

  const submitRename = (e) => {
    e.preventDefault();
    if (!renaming) return;

    const { path: oldPath, kind } = renaming;
    const result = validateRename(renameValue, oldPath, files, folders);
    setRenameError(result.error);
    if (result.error) return;

    if (result.path !== oldPath) {
      if (kind === "folder") {
        onRenameFolder(oldPath, result.path);
        // Explorer ki apni yaadasht bhi naye path ke hisaab se badalo
        setSelectedFolder((current) => renamePrefix(current, oldPath, result.path));
        setCollapsed((list) => list.map((p) => renamePrefix(p, oldPath, result.path)));
      } else {
        onRenameFile(oldPath, result.path);
      }
    }

    cancelRename();
  };

  const ctx = {
    activeFile,
    selectedFolder,
    collapsed,

    // Rename ke liye
    renaming,
    renameValue,
    renameError,
    startRename: (path, kind) => {
      setCreating(null);
      setRenaming({ path, kind });
      setRenameValue(path.split("/").pop());
      setRenameError("");
    },
    changeRename: (value) => {
      setRenameValue(value);
      setRenameError("");
    },
    cancelRename,
    submitRename,

    // Folder ki row ke chhote icons: us folder ke andar naya file ya folder banana
    newInFolder: (path, kind) => {
      setSelectedFolder(path);
      setCollapsed((list) => list.filter((p) => p !== path)); // folder khol do
      startCreating(kind);
    },

    // Folder par click: kholo ya band karo, aur use select karo
    clickFolder: (path) => {
      setSelectedFolder(path);
      setCollapsed((list) => (list.includes(path) ? list.filter((p) => p !== path) : [...list, path]));
    },

    // File kholna: uska folder select ho jata hai (naya item usi mein banega)
    openFile: (path) => {
      setSelectedFolder(parentOf(path));
      onOpen(path);
    },

    deleteFile: (path) => {
      if (window.confirm(`Delete ${path}? This cannot be undone.`)) onDeleteFile(path);
    },

    deleteFolder: (path) => {
      const count = files.filter((f) => f.startsWith(`${path}/`)).length;
      const detail = count > 0 ? ` and the ${count} file${count === 1 ? "" : "s"} inside it` : "";
      if (window.confirm(`Delete folder ${path}${detail}? This cannot be undone.`)) {
        onDeleteFolder(path);
        if (selectedFolder === path || selectedFolder.startsWith(`${path}/`)) setSelectedFolder("");
      }
    },
  };

  const tree = buildTree(files, folders);
  const isEmpty = files.length === 0 && folders.length === 0;
  const where = selectedFolder ? `${selectedFolder}/` : "the project root";

  return (
    <aside className="ws-explorer">
      <div className="ws-explorer-head">
        <span>Files</span>
        <div className="ws-explorer-actions">
          <button
            type="button"
            className="ws-icon-btn"
            onClick={() => startCreating("file")}
            aria-label="New file"
            title="New file"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </button>
          <button
            type="button"
            className="ws-icon-btn"
            onClick={() => startCreating("folder")}
            aria-label="New folder"
            title="New folder"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
          </button>
        </div>
      </div>

      {/* Naya file ya folder banane ka chhota form */}
      {creating && (
        <form className="ws-newfile" onSubmit={handleSubmit} noValidate>
          <span className="ws-newfile-where">
            New {creating} in <strong>{where}</strong>
            {selectedFolder && (
              <>
                {" "}
                <button type="button" className="ws-link" onClick={() => setSelectedFolder("")}>
                  Use root
                </button>
              </>
            )}
          </span>
          <input
            autoFocus
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setError("");
            }}
            placeholder={creating === "folder" ? "e.g. src or src/utils" : "e.g. main.py or utils/helper.py"}
            aria-label={creating === "folder" ? "New folder name" : "New file name"}
            className={error ? "ws-newfile-input has-error" : "ws-newfile-input"}
          />
          {error && <span className="ws-newfile-error">{error}</span>}
          <div className="ws-newfile-actions">
            <button type="submit" className="btn btn-primary ws-small">
              Create
            </button>
            <button type="button" className="btn btn-outline ws-small" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tree ya khali state */}
      {isEmpty && !creating ? (
        <p className="ws-explorer-empty">
          Nothing here yet. Use the buttons above to create a file like <code>main.py</code> or a
          folder like <code>src</code>.
        </p>
      ) : (
        <ul className="ws-tree" role="tree">
          <TreeLevel node={tree} parentPath="" depth={0} ctx={ctx} />
        </ul>
      )}
    </aside>
  );
}

export default FileExplorer;