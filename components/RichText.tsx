import {
	Bold, Italic,
	List, ListOrdered, Strikethrough, AlignLeft,
	AlignCenter, AlignRight, Underline, Undo2, Redo2,
	Minus, Link, Eraser, Pilcrow,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Rich Text Editor Component ───────────────────────────────────────────────
export default function RichTextEditor({
	value,
	onChange,
	placeholder = "Tulis deskripsi...",
}: {
	value: string;
	onChange: (html: string) => void;
	placeholder?: string;
}) {
	const editorRef = useRef<HTMLDivElement>(null);
	const isInternalChange = useRef(false);
	const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

	// Sync external value → editor (only when not typing)
	useEffect(() => {
		const el = editorRef.current;
		if (!el || isInternalChange.current) return;
		if (el.innerHTML !== value) el.innerHTML = value;
	}, [value]);

	// Update active format toggles on selection change
	const updateActiveFormats = useCallback(() => {
		const commands = ["bold", "italic", "underline", "strikeThrough",
			"insertUnorderedList", "insertOrderedList", "justifyLeft",
			"justifyCenter", "justifyRight"];
		const active = new Set<string>();
		commands.forEach((cmd) => {
			try { if (document.queryCommandState(cmd)) active.add(cmd); } catch { }
		});
		// Check block-level heading
		const block = document.queryCommandValue("formatBlock");
		if (block) active.add(`formatBlock:${block.toLowerCase()}`);
		setActiveFormats(active);
	}, []);

	useEffect(() => {
		document.addEventListener("selectionchange", updateActiveFormats);
		return () => document.removeEventListener("selectionchange", updateActiveFormats);
	}, [updateActiveFormats]);

	const handleInput = useCallback(() => {
		isInternalChange.current = true;
		onChange(editorRef.current?.innerHTML ?? "");
		updateActiveFormats();
		setTimeout(() => { isInternalChange.current = false; }, 0);
	}, [onChange, updateActiveFormats]);

	const exec = (command: string, val?: string) => {
		editorRef.current?.focus();
		document.execCommand(command, false, val ?? undefined);
		handleInput();
	};

	const handleLink = () => {
		const url = prompt("Masukkan URL:");
		if (url) exec("createLink", url);
	};

	const isActive = (cmd: string, val?: string) =>
		val ? activeFormats.has(`${cmd}:${val}`) : activeFormats.has(cmd);

	const btnClass = (active: boolean) =>
		`p-1.5 rounded-md transition-all text-xs font-medium ${active
			? "bg-[#E8461E] text-white shadow-sm"
			: "text-gray-500 hover:bg-white hover:text-[#E8461E] hover:shadow-sm"
		}`;

	return (
		<div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 focus-within:bg-white focus-within:border-[#E8461E] focus-within:ring-2 focus-within:ring-orange-100 transition-all">
			{/* Toolbar */}
			<div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-100/70">

				{/* Undo / Redo */}
				<button type="button" title="Undo (Ctrl+Z)" onMouseDown={(e) => { e.preventDefault(); exec("undo"); }} className={btnClass(false)}>
					<Undo2 size={13} />
				</button>
				<button type="button" title="Redo (Ctrl+Y)" onMouseDown={(e) => { e.preventDefault(); exec("redo"); }} className={btnClass(false)}>
					<Redo2 size={13} />
				</button>

				<div className="w-px h-4 bg-gray-300 mx-0.5 shrink-0" />

				{/* Text style */}
				<button type="button" title="Bold" onMouseDown={(e) => { e.preventDefault(); exec("bold"); }} className={btnClass(isActive("bold"))}>
					<Bold size={13} />
				</button>
				<button type="button" title="Italic" onMouseDown={(e) => { e.preventDefault(); exec("italic"); }} className={btnClass(isActive("italic"))}>
					<Italic size={13} />
				</button>
				<button type="button" title="Underline" onMouseDown={(e) => { e.preventDefault(); exec("underline"); }} className={btnClass(isActive("underline"))}>
					<Underline size={13} />
				</button>
				<button type="button" title="Strikethrough" onMouseDown={(e) => { e.preventDefault(); exec("strikeThrough"); }} className={btnClass(isActive("strikeThrough"))}>
					<Strikethrough size={13} />
				</button>

				<div className="w-px h-4 bg-gray-300 mx-0.5 shrink-0" />

				{/* Block format */}
				<button type="button" title="Paragraph" onMouseDown={(e) => { e.preventDefault(); exec("formatBlock", "p"); }} className={btnClass(isActive("formatBlock", "p"))}>
					<Pilcrow size={13} />
				</button>
				<button type="button" title="Heading" onMouseDown={(e) => { e.preventDefault(); exec("formatBlock", isActive("formatBlock", "h3") ? "p" : "h3"); }} className={btnClass(isActive("formatBlock", "h3"))}>
					<span className="text-[11px] font-bold leading-none">H</span>
				</button>

				<div className="w-px h-4 bg-gray-300 mx-0.5 shrink-0" />

				{/* Lists */}
				<button type="button" title="Bullet List" onMouseDown={(e) => { e.preventDefault(); exec("insertUnorderedList"); }} className={btnClass(isActive("insertUnorderedList"))}>
					<List size={13} />
				</button>
				<button type="button" title="Numbered List" onMouseDown={(e) => { e.preventDefault(); exec("insertOrderedList"); }} className={btnClass(isActive("insertOrderedList"))}>
					<ListOrdered size={13} />
				</button>

				<div className="w-px h-4 bg-gray-300 mx-0.5 shrink-0" />

				{/* Alignment */}
				<button type="button" title="Align Left" onMouseDown={(e) => { e.preventDefault(); exec("justifyLeft"); }} className={btnClass(isActive("justifyLeft"))}>
					<AlignLeft size={13} />
				</button>
				<button type="button" title="Align Center" onMouseDown={(e) => { e.preventDefault(); exec("justifyCenter"); }} className={btnClass(isActive("justifyCenter"))}>
					<AlignCenter size={13} />
				</button>
				<button type="button" title="Align Right" onMouseDown={(e) => { e.preventDefault(); exec("justifyRight"); }} className={btnClass(isActive("justifyRight"))}>
					<AlignRight size={13} />
				</button>

				<div className="w-px h-4 bg-gray-300 mx-0.5 shrink-0" />

				{/* Extras */}
				<button type="button" title="Insert Link" onMouseDown={(e) => { e.preventDefault(); handleLink(); }} className={btnClass(false)}>
					<Link size={13} />
				</button>
				<button type="button" title="Horizontal Rule" onMouseDown={(e) => { e.preventDefault(); exec("insertHorizontalRule"); }} className={btnClass(false)}>
					<Minus size={13} />
				</button>
				<button type="button" title="Clear Formatting" onMouseDown={(e) => { e.preventDefault(); exec("removeFormat"); }} className={btnClass(false)}>
					<Eraser size={13} />
				</button>
			</div>

			{/* Editable area */}
			<div
				ref={editorRef}
				contentEditable
				suppressContentEditableWarning
				onInput={handleInput}
				onKeyUp={updateActiveFormats}
				onMouseUp={updateActiveFormats}
				data-placeholder={placeholder}
				className="min-h-22.5 max-h-45 overflow-y-auto px-3 py-2 outline-none text-gray-800 text-sm leading-relaxed
					[&_h3]:font-bold [&_h3]:text-sm [&_h3]:mt-1 [&_h3]:mb-0.5
					[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1
					[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1
					[&_a]:text-[#E8461E] [&_a]:underline
					[&_hr]:border-gray-300 [&_hr]:my-2
					[&_p]:my-0.5
					empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none"
			/>
		</div>
	);
}