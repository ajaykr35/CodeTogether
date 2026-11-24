// frontend/src/pages/Workspace.jsx
// Workspace: file explorer (files aur folders), editor, output/preview aur side panel.
// Panels ko drag karke chhota-bada kar sakte hain, aur layout yaad rehta hai.
// Abhi editor ek simple text box hai. Monaco Editor Phase 6 mein aayega.

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import FileExplorer from "../components/FileExplorer.jsx";
import SidePanel from "../components/SidePanel.jsx";
import ResizeHandle from "../components/ResizeHandle.jsx";
import VideoWindow from "../components/VideoWindow.jsx";
import useLocalMedia from "../hooks/useLocalMedia.js";
import { getFileType } from "../utils/languages.js";
import "./Workspace.css";

// ---------- Layout ki settings ----------
const LAYOUT_KEY = "codetogether-layout"; // browser mein is naam se save hota hai
const EXPLORER_LIMITS = [160, 420]; // files panel ka min aur max width
const SIDE_LIMITS = [260, 600]; // right panel ka min aur max width
const BOTTOM_MIN = 80; // bottom panel ki min height

const DEFAULT_LAYOUT = {
  explorerW: 230,
  sideW: 330,
  bottomH: 170,
  explorerOpen: true,
  sideOpen: true,
  bottomOpen: true,
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const maxBottom = () => Math.max(120, Math.floor(window.innerHeight * 0.6));

// Pichhla saved layout padhta hai (galat ya khali ho to default)
function loadLayout() {
  try {
    const saved = JSON.parse(localStorage.getItem(LAYOUT_KEY)) || {};
    return {
      explorerW: clamp(Number(saved.explorerW) || DEFAULT_LAYOUT.explorerW, ...EXPLORER_LIMITS),
      sideW: clamp(Number(saved.sideW) || DEFAULT_LAYOUT.sideW, ...SIDE_LIMITS),
      bottomH: clamp(Number(saved.bottomH) || DEFAULT_LAYOUT.bottomH, BOTTOM_MIN, maxBottom()),
      explorerOpen: saved.explorerOpen !== false,
      sideOpen: saved.sideOpen !== false,
      bottomOpen: saved.bottomOpen !== false,
    };
  } catch {
    return DEFAULT_LAYOUT;
  }
}

// "a/b/c.py" ke andar ke folders: ["a", "a/b"]
function ancestorsOf(path) {
  const parts = path.split("/");
  const result = [];
  for (let i = 1; i < parts.length; i++) {
    result.push(parts.slice(0, i).join("/"));
  }
  return result;
}

// Do lists ko jodta hai, repeat hataakar
const mergeUnique = (list, extra) => [...new Set([...list, ...extra])];

function Workspace() {
  const { roomId } = useParams(); // URL se Room ID: /rooms/K7X9Q2AF

  const [files, setFiles] = useState([]); // sab files ke paths, jaise "src/main.py"
  const [folders, setFolders] = useState([]); // sab folders ke paths, jaise "src/utils"
  const [contents, setContents] = useState({}); // har file ka text
  const [openTabs, setOpenTabs] = useState([]); // jo tabs khule hain
  const [activeFile, setActiveFile] = useState(null); // abhi kaunsi file dikh rahi hai
  const [creating, setCreating] = useState(null); // null, "file" ya "folder"
  const [bottomTab, setBottomTab] = useState("output");
  const [notice, setNotice] = useState("");

  const [layout, setLayout] = useState(loadLayout);
  const media = useLocalMedia(); // mic aur camera (CallPanel aur VideoWindow dono use karte hain)

  // Layout badalte hi browser mein save karo
  useEffect(() => {
    try {
      localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
    } catch {
      // Storage na mile to koi baat nahi, bas layout yaad nahi rahega
    }
  }, [layout]);

  const updateLayout = (patch) => setLayout((current) => ({ ...current, ...patch }));
  const resetLayout = () => setLayout(DEFAULT_LAYOUT);

  // File kholna: tab mein jodo (agar pehle se nahi hai) aur use active banao
  const openFile = (path) => {
    setOpenTabs((tabs) => (tabs.includes(path) ? tabs : [...tabs, path]));
    setActiveFile(path);
  };

  // Naya file: jo folders nahi hain, wo bhi ban jate hain
  const addFile = (path) => {
    setFolders((list) => mergeUnique(list, ancestorsOf(path)));
    setFiles((list) => [...list, path]);
    setContents((all) => ({ ...all, [path]: "" }));
    openFile(path);
    setNotice("");
  };

  // Naya folder: uske upar ke folders bhi ban jate hain
  const addFolder = (path) => {
    setFolders((list) => mergeUnique(list, [...ancestorsOf(path), path]));
    setNotice("");
  };

  // Tab band karna: agar wahi active tha, to aakhri bacha hua tab active karo
  const closeTab = (path) => {
    const remaining = openTabs.filter((tab) => tab !== path);
    setOpenTabs(remaining);
    if (activeFile === path) {
      setActiveFile(remaining.length > 0 ? remaining[remaining.length - 1] : null);
    }
  };

  const deleteFile = (path) => {
    setFiles((list) => list.filter((file) => file !== path));
    setContents((all) => {
      const next = { ...all };
      delete next[path];
      return next;
    });
    closeTab(path);
  };

  // Folder delete: uske andar ke sab folders aur files bhi hat jate hain
  const deleteFolder = (path) => {
    const prefix = `${path}/`;
    const isInside = (item) => item.startsWith(prefix);
    const remainingTabs = openTabs.filter((tab) => !isInside(tab));

    setFiles((list) => list.filter((file) => !isInside(file)));
    setFolders((list) => list.filter((folder) => folder !== path && !isInside(folder)));
    setContents((all) =>
      Object.fromEntries(Object.entries(all).filter(([name]) => !isInside(name)))
    );
    setOpenTabs(remainingTabs);

    if (activeFile && isInside(activeFile)) {
      setActiveFile(remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1] : null);
    }
  };

    // File ka naam badalna (usi folder mein)
  const renameFile = (oldPath, newPath) => {
    setFiles((list) => list.map((file) => (file === oldPath ? newPath : file)));
    setContents((all) => {
      const next = { ...all };
      next[newPath] = next[oldPath];
      delete next[oldPath];
      return next;
    });
    setOpenTabs((tabs) => tabs.map((tab) => (tab === oldPath ? newPath : tab)));
    setActiveFile((current) => (current === oldPath ? newPath : current));
  };

  // Folder ka naam badalna: uske andar ke sab paths ka shuruaati hissa badal jata hai
  const renameFolder = (oldPath, newPath) => {
    const swap = (item) => {
      if (item === oldPath) return newPath;
      if (item.startsWith(`${oldPath}/`)) return newPath + item.slice(oldPath.length);
      return item;
    };

    setFiles((list) => list.map(swap));
    setFolders((list) => list.map(swap));
    setContents((all) =>
      Object.fromEntries(Object.entries(all).map(([name, text]) => [swap(name), text]))
    );
    setOpenTabs((tabs) => tabs.map(swap));
    setActiveFile((current) => (current ? swap(current) : current));
  };

  const updateContent = (value) => {
    setContents((all) => ({ ...all, [activeFile]: value }));
  };

  // Room ID clipboard par copy karna
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setNotice("Room ID copied.");
    } catch {
      setNotice("Could not copy. Please copy the Room ID from the address bar.");
    }
  };

  // Tab par kya likha dikhe: sirf naam. Do tabs ka naam same ho to poora path.
  const tabLabel = (path) => {
    const name = path.split("/").pop();
    const clash = openTabs.some((tab) => tab !== path && tab.split("/").pop() === name);
    return clash ? path : name;
  };

  const fileType = activeFile ? getFileType(activeFile) : null;

  // Grid ke columns: [files] [divider] [center] [divider] [side panel]
  const columns = [];
  if (layout.explorerOpen) columns.push(`${layout.explorerW}px`, "6px");
  columns.push("minmax(0, 1fr)");
  if (layout.sideOpen) columns.push("6px", `${layout.sideW}px`);

  return (
    <div className="ws">
      {/* Top bar */}
      <div className="ws-topbar">
        <Link to="/dashboard" className="ws-back">
          &larr; Dashboard
        </Link>
        <span className="ws-sep"></span>
        <div className="ws-title">
          <strong>Workspace</strong>
          <span className="ws-roomid">{roomId}</span>
        </div>

        {/* Layout ke buttons */}
        <div className="ws-layoutbtns">
          <button
            type="button"
            className={layout.explorerOpen ? "ws-toggle active" : "ws-toggle"}
            aria-pressed={layout.explorerOpen}
            onClick={() => updateLayout({ explorerOpen: !layout.explorerOpen })}
          >
            Files
          </button>
          <button
            type="button"
            className={layout.sideOpen ? "ws-toggle active" : "ws-toggle"}
            aria-pressed={layout.sideOpen}
            onClick={() => updateLayout({ sideOpen: !layout.sideOpen })}
          >
            Panel
          </button>
          <button type="button" className="ws-toggle" onClick={resetLayout}>
            Reset layout
          </button>
        </div>

        <button type="button" className="btn btn-outline ws-small" onClick={copyRoomId}>
          Copy Room ID
        </button>
      </div>

      <div className="ws-body" style={{ gridTemplateColumns: columns.join(" ") }}>
        {/* Left: files aur folders */}
        {layout.explorerOpen && (
          <>
            <FileExplorer
              files={files}
              folders={folders}
              activeFile={activeFile}
              creating={creating}
              setCreating={setCreating}
              onAddFile={addFile}
              onAddFolder={addFolder}
              onOpen={openFile}
              onDeleteFile={deleteFile}
              onDeleteFolder={deleteFolder}
              onRenameFile={renameFile}
              onRenameFolder={renameFolder}
            />

            <ResizeHandle
              orientation="vertical"
              label="Resize files panel"
              size={layout.explorerW}
              onSize={(value) => updateLayout({ explorerW: clamp(value, ...EXPLORER_LIMITS) })}
              onReset={() => updateLayout({ explorerW: DEFAULT_LAYOUT.explorerW })}
            />
          </>
        )}

        {/* Center: editor */}
        <section className="ws-center">
          {/* Tabs */}
          <div className="ws-tabs">
            {openTabs.map((path) => (
              <div key={path} className={path === activeFile ? "ws-tab active" : "ws-tab"}>
                <button
                  type="button"
                  className="ws-tab-name"
                  title={path}
                  onClick={() => setActiveFile(path)}
                >
                  {tabLabel(path)}
                </button>
                <button
                  type="button"
                  className="ws-tab-close"
                  onClick={() => closeTab(path)}
                  aria-label={`Close ${path}`}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          {activeFile ? (
            <>
              {/* Toolbar: language, file ka path aur actions */}
              <div className="ws-toolbar">
                <div className="ws-toolbar-left">
                  <span className="ws-lang">{fileType.label}</span>
                  <span className="ws-path">{activeFile.split("/").join(" \u203A ")}</span>
                </div>
                <div className="ws-toolbar-actions">
                  {fileType.run && (
                    <button
                      type="button"
                      className="btn btn-primary ws-small"
                      onClick={() => {
                        setBottomTab("output");
                        updateLayout({ bottomOpen: true });
                        setNotice("Running code connects to Judge0 in Phase 9.");
                      }}
                    >
                      Run
                    </button>
                  )}
                  {fileType.preview && (
                    <button
                      type="button"
                      className="btn btn-outline ws-small"
                      onClick={() => {
                        setBottomTab("preview");
                        updateLayout({ bottomOpen: true });
                        setNotice("Live preview is added after the editor and live sync phases.");
                      }}
                    >
                      Preview
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-outline ws-small"
                    onClick={() => setNotice("Saving sessions is added in Phase 10.")}
                  >
                    Save
                  </button>
                </div>
              </div>

              <textarea
                className="ws-editor"
                value={contents[activeFile] ?? ""}
                onChange={(e) => updateContent(e.target.value)}
                spellCheck={false}
                aria-label={`Editor for ${activeFile}`}
                placeholder="Start typing. Monaco Editor replaces this box in Phase 6."
              />
            </>
          ) : (
            <div className="ws-empty">
              <h2>Create a file or folder to start</h2>
              <p>
                Name a file like <code>main.py</code>, <code>Main.java</code> or{" "}
                <code>index.html</code>, or type a path like <code>src/app.py</code> to put it
                inside a folder. The language is detected from the file extension.
              </p>
              <div className="ws-empty-actions">
                <button type="button" className="btn btn-primary" onClick={() => {
                  updateLayout({ explorerOpen: true });
                  setCreating("file");
                }}>
                  New file
                </button>
                <button type="button" className="btn btn-outline" onClick={() => {
                  updateLayout({ explorerOpen: true });
                  setCreating("folder");
                }}>
                  New folder
                </button>
              </div>
            </div>
          )}

          {/* Editor aur bottom panel ke beech ka divider (bottom khula ho tabhi) */}
          {layout.bottomOpen && (
            <ResizeHandle
              orientation="horizontal"
              label="Resize output panel"
              direction={-1}
              size={layout.bottomH}
              onSize={(value) => updateLayout({ bottomH: clamp(value, BOTTOM_MIN, maxBottom()) })}
              onReset={() => updateLayout({ bottomH: DEFAULT_LAYOUT.bottomH })}
            />
          )}

          {/* Bottom: output aur preview */}
          <div
            className="ws-bottom"
            style={{ height: layout.bottomOpen ? layout.bottomH : "auto" }}
          >
            <div className="ws-bottom-tabs">
              <button
                type="button"
                className={bottomTab === "output" ? "active" : ""}
                onClick={() => setBottomTab("output")}
              >
                Output
              </button>
              <button
                type="button"
                className={bottomTab === "preview" ? "active" : ""}
                onClick={() => setBottomTab("preview")}
              >
                Preview
              </button>
              <button
                type="button"
                className="ws-bottom-toggle"
                onClick={() => updateLayout({ bottomOpen: !layout.bottomOpen })}
                aria-expanded={layout.bottomOpen}
              >
                {layout.bottomOpen ? "Hide" : "Show"}
              </button>
            </div>

            {layout.bottomOpen && (
              <div className="ws-bottom-body">
                {bottomTab === "output" ? (
                  <p>Run a file to see its output here.</p>
                ) : (
                  <p>Open an HTML file and press Preview to see your page here.</p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Right: call, chat, people, history, review */}
        {layout.sideOpen && (
          <>
            <ResizeHandle
              orientation="vertical"
              label="Resize side panel"
              direction={-1}
              size={layout.sideW}
              onSize={(value) => updateLayout({ sideW: clamp(value, ...SIDE_LIMITS) })}
              onReset={() => updateLayout({ sideW: DEFAULT_LAYOUT.sideW })}
            />
            <SidePanel onNotice={setNotice} media={media} />
          </>
        )}
      </div>

      {/* Status bar */}
      <div className="ws-status">
        <span>
          {notice || "Layout preview. Editor, run, preview and live sync connect in later phases."}
        </span>
        <span>{fileType ? fileType.label : "No file open"}</span>
      </div>

      {/* Floating video window (camera on hone par dikhti hai) */}
      <VideoWindow stream={media.videoStream} />
    </div>
  );
}

export default Workspace;