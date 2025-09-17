"use client";

import { File, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface FileInputProps {
	value: File | null;
	onChange: (file: File | null) => void;
	accept: string;
	placeholder: string;
	onLanguageInfer?: (file: File) => void;
}

export function FileInput({
	value,
	onChange,
	accept,
	placeholder,
	onLanguageInfer,
}: FileInputProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDragOver, setIsDragOver] = useState(false);

	const handleFileSelect = (file: File | null) => {
		onChange(file);
		if (file && onLanguageInfer) {
			onLanguageInfer(file);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
		const files = e.dataTransfer.files;
		if (files.length > 0) {
			handleFileSelect(files[0]);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
	};

	const handleButtonClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		handleFileSelect(file);
		// Reset the input value so the same file can be selected again if needed
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div className="space-y-2">
			{/* Hidden file input */}
			<input
				ref={fileInputRef}
				type="file"
				accept={accept}
				onChange={handleFileInputChange}
				className="hidden"
			/>

			{/* Drop zone button */}
			<button
				type="button"
				className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors w-full ${
					isDragOver
						? "border-primary bg-primary/5"
						: "border-muted-foreground/25 hover:border-primary/50"
				}`}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onClick={handleButtonClick}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						handleButtonClick();
					}
				}}
			>
				<div className="flex flex-col items-center gap-2">
					<Upload className="h-8 w-8 text-muted-foreground" />
					<div className="text-sm">
						<span className="font-medium text-primary">Click to upload</span> or
						drag and drop
					</div>
					<div className="text-xs text-muted-foreground">{placeholder}</div>
				</div>
			</button>

			{/* File preview */}
			{value && (
				<div className="flex items-center gap-2 p-2 bg-muted rounded-md">
					<File className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm flex-1 truncate">{value.name}</span>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => handleFileSelect(null)}
						className="h-6 w-6 p-0"
					>
						<X className="h-3 w-3" />
					</Button>
				</div>
			)}
		</div>
	);
}
