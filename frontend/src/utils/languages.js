// frontend/src/utils/languages.js
// File ke naam (extension) se language aur uske actions pehchanne ke liye.
// Room banate waqt language nahi chunni padti. Har file ki language uske
// extension se apne aap tay hoti hai, bilkul VS Code ki tarah.
//
// label   = screen par dikhne wala naam
// monaco  = Monaco Editor ka language naam (syntax colors ke liye)
// run     = Run button (Judge0) chalega ya nahi  (Phase 9 mein jodenge)
// preview = Preview panel mein dikhega ya nahi   (live preview mein jodenge)

const FILE_TYPES = {
  html: { label: "HTML", monaco: "html", run: false, preview: true },
  css: { label: "CSS", monaco: "css", run: false, preview: true },
  js: { label: "JavaScript", monaco: "javascript", run: true, preview: true },
  py: { label: "Python", monaco: "python", run: true, preview: false },
  java: { label: "Java", monaco: "java", run: true, preview: false },
  cpp: { label: "C++", monaco: "cpp", run: true, preview: false },
  c: { label: "C", monaco: "c", run: true, preview: false },
  json: { label: "JSON", monaco: "json", run: false, preview: false },
  md: { label: "Markdown", monaco: "markdown", run: false, preview: false },
  txt: { label: "Plain text", monaco: "plaintext", run: false, preview: false },
};

const UNKNOWN_TYPE = {
  label: "Plain text",
  monaco: "plaintext",
  run: false,
  preview: false,
};

// "src/Main.java" -> { label: "Java", monaco: "java", run: true, preview: false }
export function getFileType(fileName) {
  // Folder wale path mein se sirf file ka naam lete hain: "src/Main.java" -> "Main.java"
  const baseName = fileName.slice(fileName.lastIndexOf("/") + 1);

  const dotIndex = baseName.lastIndexOf(".");
  if (dotIndex === -1) return UNKNOWN_TYPE; // extension hai hi nahi

  const extension = baseName.slice(dotIndex + 1).toLowerCase();
  return FILE_TYPES[extension] || UNKNOWN_TYPE;
}
// "Add web starter files" checkbox dabane par ye files banengi
export const WEB_STARTER_FILES = ["index.html", "style.css", "script.js"];
