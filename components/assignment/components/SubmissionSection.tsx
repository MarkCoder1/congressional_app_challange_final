// /components/assignment/components/SubmissionSection.tsx
import { Upload, FileText, X, Plus } from "lucide-react";

interface SubmissionSectionProps {
  finalOutput: string;
  onFinalOutputChange: (value: string) => void;
  links: string[];
  newLink: string;
  onNewLinkChange: (value: string) => void;
  onAddLink: () => void;
  onRemoveLink: (idx: number) => void;
  files: any[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (idx: number) => void;
  externalTools: Array<{ type: string; url: string }>;
  newToolType: string;
  newToolUrl: string;
  onNewToolTypeChange: (value: any) => void;
  onNewToolUrlChange: (value: string) => void;
  onAddTool: () => void;
  onRemoveTool: (idx: number) => void;
}

export function SubmissionSection({
  finalOutput,
  onFinalOutputChange,
  links,
  newLink,
  onNewLinkChange,
  onAddLink,
  onRemoveLink,
  files,
  onFileUpload,
  onRemoveFile,
  externalTools,
  newToolType,
  newToolUrl,
  onNewToolTypeChange,
  onNewToolUrlChange,
  onAddTool,
  onRemoveTool,
}: SubmissionSectionProps) {
  return (
    <div className="bg-card rounded-xl p-5 border border-border space-y-6">
      <h3 className="font-semibold mb-2">📄 Your work (required)</h3>

      {/* Text submission */}
      <div>
        <label className="block font-medium mb-1">Written answer</label>
        <textarea
          value={finalOutput}
          onChange={(e) => onFinalOutputChange(e.target.value)}
          rows={6}
          className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-accent"
          placeholder="Write your assignment here..."
        />
      </div>

      {/* Links */}
      <div>
        <label className="block font-medium mb-1">🔗 Research links</label>
        <div className="flex gap-2 mb-2">
          <input
            type="url"
            value={newLink}
            onChange={(e) => onNewLinkChange(e.target.value)}
            placeholder="https://..."
            className="flex-1 p-2 rounded-md border border-border bg-background"
          />
          <button onClick={onAddLink} className="btn-secondary px-3 py-1 text-sm">Add link</button>
        </div>
        {links.length > 0 && (
          <ul className="space-y-1">
            {links.map((link, idx) => (
              <li key={idx} className="flex items-center justify-between gap-2 p-2 bg-secondary/20 rounded-lg">
                <a href={link} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-sm truncate">
                  {link}
                </a>
                <button onClick={() => onRemoveLink(idx)} className="text-muted-foreground hover:text-red-500">
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Files */}
      <div>
        <label className="block font-medium mb-1">📎 Attachments</label>
        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.jpg,.png"
            onChange={onFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center gap-2 text-accent hover:underline">
            <Upload size={16} /> Click to upload PDF, DOCX, or images
          </label>
        </div>
        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-secondary/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText size={14} />
                  <span className="text-sm truncate">{file.name}</span>
                </div>
                <button onClick={() => onRemoveFile(idx)} className="text-muted-foreground hover:text-red-500">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* External tools */}
      <div>
        <label className="block font-medium mb-1">🛠️ External tools (Canva, Google Docs, Figma, etc.)</label>
        <div className="flex gap-2 mb-2">
          <select
            value={newToolType}
            onChange={(e) => onNewToolTypeChange(e.target.value)}
            className="px-2 py-1 rounded-md border border-border bg-background"
          >
            <option value="canva">Canva</option>
            <option value="google-docs">Google Docs</option>
            <option value="figma">Figma</option>
            <option value="other">Other</option>
          </select>
          <input
            type="url"
            value={newToolUrl}
            onChange={(e) => onNewToolUrlChange(e.target.value)}
            placeholder="Link to your work"
            className="flex-1 p-2 rounded-md border border-border bg-background"
          />
          <button onClick={onAddTool} className="btn-secondary px-3 py-1 text-sm">Add</button>
        </div>
        {externalTools.length > 0 && (
          <ul className="space-y-1">
            {externalTools.map((tool, idx) => (
              <li key={idx} className="flex items-center justify-between gap-2 p-2 bg-secondary/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium capitalize">{tool.type}</span>
                  <a href={tool.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-sm truncate">
                    {tool.url}
                  </a>
                </div>
                <button onClick={() => onRemoveTool(idx)} className="text-muted-foreground hover:text-red-500">
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}