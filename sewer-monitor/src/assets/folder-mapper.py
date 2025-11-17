import os
import re
import json
import datetime
import logging
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from collections import defaultdict
import subprocess
import platform
from pathlib import Path
import time

# Configure logging
logging.basicConfig(
    filename='enhanced_file_mapper.log',
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Define Unicode characters for checked and unchecked states
CHECKED = "☑"
UNCHECKED = "☐"

# Common development folders and files to always ignore
ALWAYS_IGNORE_DIRS = {
    '.git', '__pycache__', 'node_modules', '.pytest_cache', 
    'venv', 'env', '.env', '.venv', 'virtualenv', '.virtualenv',
    '.tox', 'dist', 'build', '*.egg-info', '.eggs',
    '.coverage', 'htmlcov', '.hypothesis', '.mypy_cache',
    '.ruff_cache', '.sass-cache', 'bower_components',
    '.next', '.nuxt', '.output', '.vercel', '.netlify'
}

ALWAYS_IGNORE_PATTERNS = {
    '*.pyc', '*.pyo', '*.pyd', '__pycache__',
    '*.so', '*.dylib', '*.dll', '*.class',
    '.DS_Store', 'Thumbs.db', 'desktop.ini',
    '*.swp', '*.swo', '*~', '*.bak', '*.tmp',
    '*.log', '*.pid', '*.seed', '*.pid.lock'
}

def should_ignore_path(file_path, base_path):
    """Check if a path should be ignored based on common development patterns"""
    import fnmatch
    
    rel_path = os.path.relpath(file_path, base_path)
    path_parts = rel_path.split(os.sep)
    
    # Check if any part of the path contains ignored directories
    for part in path_parts:
        if part in ALWAYS_IGNORE_DIRS:
            return True
        # Check for egg-info pattern
        if part.endswith('.egg-info'):
            return True
    
    # Check file patterns
    file_name = os.path.basename(file_path)
    for pattern in ALWAYS_IGNORE_PATTERNS:
        if fnmatch.fnmatch(file_name, pattern):
            return True
    
    return False

def format_file_size(size_bytes):
    """Format file size in human-readable format"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} TB"

def copy_to_clipboard(text):
    """Copy text to clipboard"""
    root = tk.Tk()
    root.withdraw()
    root.clipboard_clear()
    root.clipboard_append(text)
    root.update()
    root.destroy()
    messagebox.showinfo("Copied", "Summary copied to clipboard!")

def extract_py_details(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            function_pattern = re.compile(r'def\s+(\w+)')
            class_pattern = re.compile(r'class\s+(\w+)')
            functions = re.findall(function_pattern, content)
            classes = re.findall(class_pattern, content)
        return {
            'file': file_path,
            'type': 'Python',
            'functions': functions,
            'classes': classes,
            'content': content,
            'lines': len(content.splitlines())
        }
    except Exception as e:
        logging.error(f"Error extracting Python details from {file_path}: {e}")
        return {
            'file': file_path,
            'type': 'Python',
            'functions': [],
            'classes': [],
            'content': "Error reading file content.",
            'lines': 0
        }

def extract_js_details(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            function_pattern = re.compile(r'function\s+(\w+)\s*\(')
            arrow_function_pattern = re.compile(r'const\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=])\s*=>')
            class_pattern = re.compile(r'class\s+(\w+)\s*{')
            functions = re.findall(function_pattern, content)
            arrow_functions = re.findall(arrow_function_pattern, content)
            functions.extend(arrow_functions)
            classes = re.findall(class_pattern, content)
        return {
            'file': file_path,
            'type': 'JavaScript',
            'functions': functions,
            'classes': classes,
            'content': content,
            'lines': len(content.splitlines())
        }
    except Exception as e:
        logging.error(f"Error extracting JavaScript details from {file_path}: {e}")
        return {
            'file': file_path,
            'type': 'JavaScript',
            'functions': [],
            'classes': [],
            'content': "Error reading file content.",
            'lines': 0
        }

def extract_css_details(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            class_pattern = re.compile(r'\.([\w-]+)\s*{')
            id_pattern = re.compile(r'#([\w-]+)\s*{')
            classes = re.findall(class_pattern, content)
            ids = re.findall(id_pattern, content)
        return {
            'file': file_path,
            'type': 'CSS',
            'classes': classes,
            'ids': ids,
            'content': content,
            'lines': len(content.splitlines())
        }
    except Exception as e:
        logging.error(f"Error extracting CSS details from {file_path}: {e}")
        return {
            'file': file_path,
            'type': 'CSS',
            'classes': [],
            'ids': [],
            'content': "Error reading file content.",
            'lines': 0
        }

def extract_html_details(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        return {
            'file': file_path,
            'type': 'HTML',
            'content': content,
            'lines': len(content.splitlines())
        }
    except Exception as e:
        logging.error(f"Error extracting HTML details from {file_path}: {e}")
        return {
            'file': file_path,
            'type': 'HTML',
            'content': "Error reading file content.",
            'lines': 0
        }

def extract_other_files(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
            content = file.read()
            lines = len(content.splitlines())
    except Exception as e:
        logging.error(f"Error extracting details from {file_path}: {e}")
        content = "Unable to read file content."
        lines = 0
    return {
        'file': file_path,
        'type': 'Other',
        'content': content,
        'lines': lines
    }

def create_summary_text(file_details, folder_path, format_type='text'):
    """Create summary in specified format"""
    output = []
    
    # Add statistics header
    total_files = len(file_details)
    total_lines = sum(d.get('lines', 0) for d in file_details)
    file_type_counts = defaultdict(int)
    for detail in file_details:
        file_type_counts[detail['type']] += 1
    
    if format_type == 'markdown':
        output.append("# File Summary Report")
        output.append(f"\n**Generated:** {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        output.append(f"**Folder:** `{folder_path}`")
        output.append(f"\n## Statistics")
        output.append(f"- **Total Files:** {total_files}")
        output.append(f"- **Total Lines:** {total_lines:,}")
        output.append(f"\n### File Types")
        for ftype, count in sorted(file_type_counts.items()):
            output.append(f"- {ftype}: {count} files")
        output.append("\n---\n")
    else:
        output.append("=" * 60)
        output.append("FILE SUMMARY REPORT")
        output.append("=" * 60)
        output.append(f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        output.append(f"Folder: {folder_path}")
        output.append(f"\nStatistics:")
        output.append(f"  Total Files: {total_files}")
        output.append(f"  Total Lines: {total_lines:,}")
        output.append(f"\nFile Types:")
        for ftype, count in sorted(file_type_counts.items()):
            output.append(f"  - {ftype}: {count} files")
        output.append("\n" + "=" * 60 + "\n")
    
    # Group files by type
    details_by_type = defaultdict(list)
    for detail in file_details:
        details_by_type[detail['type']].append(detail)
    
    # Add file details
    for file_type, details in sorted(details_by_type.items()):
        if format_type == 'markdown':
            output.append(f"## {file_type} Files\n")
        else:
            output.append(f"=== {file_type} Files ===\n")
        
        for detail in details:
            rel_path = os.path.relpath(detail['file'], folder_path)
            
            if format_type == 'markdown':
                output.append(f"### `{rel_path}`")
                output.append(f"*Lines: {detail.get('lines', 0)}*\n")
                
                if file_type in ['Python', 'JavaScript']:
                    if detail['functions']:
                        output.append(f"**Functions:** `{', '.join(detail['functions'])}`")
                    if detail['classes']:
                        output.append(f"**Classes:** `{', '.join(detail['classes'])}`")
                elif file_type == 'CSS':
                    if detail.get('classes'):
                        output.append(f"**Classes:** `{', '.join(detail['classes'][:10])}`" + 
                                    (" ..." if len(detail['classes']) > 10 else ""))
                
                output.append("\n```" + (file_type.lower() if file_type != 'Other' else ''))
                output.append(detail['content'])
                output.append("```\n")
            else:
                output.append("---")
                output.append(f"File: {rel_path}")
                output.append(f"Lines: {detail.get('lines', 0)}")
                output.append("---")
                
                if file_type in ['Python', 'JavaScript']:
                    output.append(f"Functions: {', '.join(detail['functions']) if detail['functions'] else 'None'}")
                    output.append(f"Classes: {', '.join(detail['classes']) if detail['classes'] else 'None'}")
                elif file_type == 'CSS':
                    if detail.get('classes'):
                        output.append(f"Classes: {', '.join(detail['classes'][:10])}" + 
                                    (" ..." if len(detail['classes']) > 10 else ""))
                
                output.append("\nContents:")
                output.append(detail['content'])
                output.append("\n")
    
    return '\n'.join(output)

def create_and_save_summary(folder_path, selected_files, output_format='text', copy_clipboard=False):
    logging.info(f"Creating summary for folder: {folder_path}")
    
    # Categorize files by extension
    categorized_files = defaultdict(list)
    for file in selected_files:
        ext = os.path.splitext(file)[1].lower()
        categorized_files[ext].append(file)
    
    # Extract details based on file type
    file_details = []
    for ext, files in categorized_files.items():
        for file in files:
            if not os.path.exists(file):
                logging.warning(f"File does not exist: {file}")
                continue
            if os.path.isdir(file):
                logging.warning(f"Skipping directory: {file}")
                continue
            try:
                if ext == '.py':
                    detail = extract_py_details(file)
                elif ext in ['.js', '.jsx', '.ts', '.tsx']:
                    detail = extract_js_details(file)
                elif ext == '.css':
                    detail = extract_css_details(file)
                elif ext in ['.html', '.htm']:
                    detail = extract_html_details(file)
                elif os.path.basename(file).lower() in ['dockerfile', 'docker-compose.yml', 'docker-compose.yaml', 'dockerfile.dev']:
                    detail = extract_other_files(file)
                    detail['type'] = 'Docker'
                else:
                    detail = extract_other_files(file)
                file_details.append(detail)
            except Exception as e:
                logging.error(f"Error processing file {file}: {e}")
    
    if not file_details:
        messagebox.showwarning("No Files to Process", "No valid files were selected to create a summary.")
        logging.warning("No valid files found for summary creation.")
        return
    
    # Generate summary content
    summary_content = create_summary_text(file_details, folder_path, output_format)
    
    # Copy to clipboard if requested
    if copy_clipboard:
        copy_to_clipboard(summary_content)
    
    # Save to file
    timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    extension = '.md' if output_format == 'markdown' else '.txt'
    output_file_path = os.path.join(folder_path, f'map-{timestamp}{extension}')
    
    try:
        with open(output_file_path, 'w', encoding='utf-8') as summary_file:
            summary_file.write(summary_content)
        logging.info(f"Summary file created at {output_file_path}")
        messagebox.showinfo("Summary Created", f"Summary file created: {output_file_path}")
    except Exception as e:
        logging.error(f"Error writing summary file {output_file_path}: {e}")
        messagebox.showerror("Error", f"Failed to create summary file: {e}")

def load_preferences():
    """Load preferences with backwards compatibility for old config files"""
    # Try new preferences file first
    new_pref_file = os.path.join(os.path.dirname(__file__), 'enhanced_folder_preferences.json')
    old_pref_file = os.path.join(os.path.dirname(__file__), 'folder_preferences.json')
    
    # Check for new preferences file
    if os.path.exists(new_pref_file):
        try:
            with open(new_pref_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logging.warning(f"Error loading new preferences: {e}")
    
    # Fall back to old preferences file for backwards compatibility
    if os.path.exists(old_pref_file):
        try:
            with open(old_pref_file, 'r', encoding='utf-8') as f:
                old_prefs = json.load(f)
                
                # Migrate old preferences to new format if needed
                if isinstance(old_prefs, dict):
                    # Save to new file for future use
                    save_preferences(old_prefs)
                    logging.info("Migrated old preferences to new format")
                    return old_prefs
        except Exception as e:
            logging.warning(f"Error loading old preferences: {e}")
    
    return {}

def save_preferences(all_prefs):
    pref_file = os.path.join(os.path.dirname(__file__), 'enhanced_folder_preferences.json')
    try:
        with open(pref_file, 'w', encoding='utf-8') as f:
            json.dump(all_prefs, f, indent=4)
        logging.info("Preferences saved")
    except Exception as e:
        logging.error(f"Error saving preferences: {e}")

def load_folder_preferences(folder_path):
    """Load preferences for a specific folder with backwards compatibility"""
    prefs = load_preferences()
    folder_prefs = prefs.get(folder_path, {})
    
    # Ensure folder_prefs is a dict
    if not isinstance(folder_prefs, dict):
        logging.warning(f"Invalid preferences for folder {folder_path}, resetting")
        folder_prefs = {}
    
    # Extract saved extensions and files
    saved_extensions = folder_prefs.get('extensions', [])
    saved_files = folder_prefs.get('files', [])
    
    # Validate saved files exist
    valid_saved_files = [f for f in saved_files if os.path.exists(f) and os.path.isfile(f)]
    
    if len(valid_saved_files) < len(saved_files):
        logging.info(f"Some saved files no longer exist for {folder_path}")
    
    return saved_extensions, valid_saved_files

def get_recent_folders(max_folders=10):
    """Get list of recently used folders"""
    prefs = load_preferences()
    recent = prefs.get('_recent_folders', [])
    return recent[:max_folders]

def add_to_recent_folders(folder_path):
    """Add folder to recent folders list"""
    prefs = load_preferences()
    recent = prefs.get('_recent_folders', [])
    
    # Remove if already exists
    if folder_path in recent:
        recent.remove(folder_path)
    
    # Add to front
    recent.insert(0, folder_path)
    
    # Keep only last 10
    recent = recent[:10]
    
    prefs['_recent_folders'] = recent
    save_preferences(prefs)

def get_file_modified_times(folder_path):
    """Get modification times for tracking new/changed files"""
    prefs = load_preferences()
    folder_prefs = prefs.get(folder_path, {})
    return folder_prefs.get('file_times', {})

def save_file_modified_times(folder_path, selected_files):
    """Save modification times for selected files"""
    prefs = load_preferences()
    if folder_path not in prefs:
        prefs[folder_path] = {}
    
    file_times = {}
    for file in selected_files:
        if os.path.exists(file):
            file_times[file] = os.path.getmtime(file)
    
    prefs[folder_path]['file_times'] = file_times
    save_preferences(prefs)

def get_all_extensions(folder_path):
    extensions = set()
    for root, dirs, filenames in os.walk(folder_path):
        # Filter out directories we should ignore (modifies dirs in place)
        dirs[:] = [d for d in dirs if d not in ALWAYS_IGNORE_DIRS]
        
        for filename in filenames:
            # Skip files that match ignore patterns
            full_path = os.path.join(root, filename)
            if should_ignore_path(full_path, folder_path):
                continue
            
            ext = os.path.splitext(filename)[1].lower()
            if ext:
                extensions.add(ext)
            else:
                extensions.add('')
    return sorted(extensions)

class ExtensionSelector:
    def __init__(self, folder_path, saved_extensions):
        self.folder_path = folder_path
        self.saved_extensions = saved_extensions
        self.selected_extensions = []
        
        self.root = tk.Tk()
        self.root.title("Select File Extensions")
        self.root.geometry("500x550")
        
        # Center window
        self.root.update_idletasks()
        width = 500
        height = 550
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f'{width}x{height}+{x}+{y}')
        
        self.setup_ui()
    
    def setup_ui(self):
        # Main frame
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Preset buttons frame
        preset_frame = ttk.LabelFrame(main_frame, text="Quick Presets")
        preset_frame.pack(fill=tk.X, pady=(0, 10))
        
        presets = [
            ("Code Files", ['.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.cpp', '.c', '.h']),
            ("Web Files", ['.html', '.htm', '.css', '.js', '.jsx']),
            ("Config Files", ['.json', '.yaml', '.yml', '.toml', '.env', '.ini']),
            ("Docs", ['.md', '.txt', '.rst', '.pdf'])
        ]
        
        for name, exts in presets:
            btn = ttk.Button(preset_frame, text=name, 
                           command=lambda e=exts: self.apply_preset(e))
            btn.pack(side=tk.LEFT, padx=5, pady=5)
        
        # Extensions list frame
        list_frame = ttk.LabelFrame(main_frame, text="File Extensions")
        list_frame.pack(fill=tk.BOTH, expand=True)
        
        # Create canvas and scrollbar
        canvas = tk.Canvas(list_frame)
        scrollbar = ttk.Scrollbar(list_frame, orient="vertical", command=canvas.yview)
        self.scrollable_frame = ttk.Frame(canvas)
        
        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Get extensions and create checkboxes
        extensions = get_all_extensions(self.folder_path)
        self.ext_vars = {}
        
        for ext in extensions:
            var = tk.BooleanVar(value=(ext in self.saved_extensions) if self.saved_extensions else True)
            self.ext_vars[ext] = var
            display_ext = ext if ext else "[No Extension]"
            chk = ttk.Checkbutton(self.scrollable_frame, text=display_ext, variable=var)
            chk.pack(anchor=tk.W, pady=2)
        
        # Button frame
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X, pady=(10, 0))
        
        ttk.Button(button_frame, text="Select All", 
                  command=self.select_all).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Clear All", 
                  command=self.clear_all).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Confirm", 
                  command=self.confirm).pack(side=tk.RIGHT, padx=5)
    
    def apply_preset(self, extensions):
        # First clear all
        for var in self.ext_vars.values():
            var.set(False)
        # Then set preset extensions
        for ext in extensions:
            if ext in self.ext_vars:
                self.ext_vars[ext].set(True)
    
    def select_all(self):
        for var in self.ext_vars.values():
            var.set(True)
    
    def clear_all(self):
        for var in self.ext_vars.values():
            var.set(False)
    
    def confirm(self):
        self.selected_extensions = [ext for ext, var in self.ext_vars.items() if var.get()]
        if not self.selected_extensions:
            if not messagebox.askyesno("No Extensions Selected", 
                                      "No extensions selected. Continue anyway?"):
                return
        self.root.quit()
        self.root.destroy()
    
    def run(self):
        self.root.mainloop()
        return self.selected_extensions

class FileSelector:
    def __init__(self, folder_path, selected_extensions, saved_selected_files):
        self.folder_path = folder_path
        self.selected_extensions = selected_extensions
        self.saved_selected_files = saved_selected_files
        
        # Get previous file times for highlighting
        self.previous_file_times = get_file_modified_times(folder_path)
        
        self.root = tk.Tk()
        self.root.title("Select Files")
        self.root.geometry("900x700")
        
        # Center window
        self.root.update_idletasks()
        width = 900
        height = 700
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f'{width}x{height}+{x}+{y}')
        
        self.selected_files = []
        self.file_vars = {}
        self.item_to_file = {}
        self.all_items = []
        
        self.setup_ui()
        self.populate_tree()
    
    def setup_ui(self):
        # Main frame
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Search frame
        search_frame = ttk.Frame(main_frame)
        search_frame.pack(fill=tk.X, pady=(0, 5))
        
        ttk.Label(search_frame, text="Search:").pack(side=tk.LEFT, padx=(0, 5))
        self.search_var = tk.StringVar()
        
        # Use trace_add for newer versions, fallback to trace for older versions
        try:
            self.search_var.trace_add('write', self.filter_tree)
        except AttributeError:
            # Fallback for older Tkinter versions
            self.search_var.trace('w', self.filter_tree)
        
        search_entry = ttk.Entry(search_frame, textvariable=self.search_var, width=30)
        search_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        ttk.Button(search_frame, text="Clear", 
                  command=lambda: self.search_var.set("")).pack(side=tk.LEFT, padx=5)
        
        # Tree frame
        tree_frame = ttk.Frame(main_frame)
        tree_frame.pack(fill=tk.BOTH, expand=True)
        
        # Create Treeview with custom style
        style = ttk.Style()
        
        # Configure the Treeview colors to ensure readability
        style.configure("Treeview",
                       background="white",
                       foreground="black",
                       fieldbackground="white")
        style.configure("Treeview.Heading",
                       background="lightgray",
                       foreground="black")
        
        # Map style changes for selection
        style.map('Treeview',
                 background=[('selected', '#0078d7')],
                 foreground=[('selected', 'white')])
        
        self.tree = ttk.Treeview(tree_frame, columns=("Size", "Modified", "Select"), 
                                show="tree headings", style="Treeview")
        self.tree.heading("#0", text="Files and Folders")
        self.tree.heading("Size", text="Size")
        self.tree.heading("Modified", text="Status")
        self.tree.heading("Select", text="Select")
        
        self.tree.column("Size", width=80, anchor="e")
        self.tree.column("Modified", width=80, anchor="center")
        self.tree.column("Select", width=60, anchor="center")
        
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        scrollbar = ttk.Scrollbar(tree_frame, orient="vertical", command=self.tree.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        # Configure tags with explicit colors
        self.tree.tag_configure('folder', 
                               background='#e0e0e0', 
                               foreground='black',
                               font=('TkDefaultFont', 10, 'bold'))
        self.tree.tag_configure('file', 
                               background='white',
                               foreground='black')
        self.tree.tag_configure('new_file', 
                               background='#e6ffe6',  # Light green
                               foreground='black')
        self.tree.tag_configure('modified_file', 
                               background='#fff3e6',  # Light orange
                               foreground='black')
        self.tree.tag_configure('alternate', 
                               background='#f9f9f9',  # Very light gray
                               foreground='black')
        
        # Bind events
        self.tree.bind("<Button-1>", self.toggle_check)
        self.tree.bind('<space>', self.on_space)
        
        # Status label
        self.status_label = ttk.Label(main_frame, text="")
        self.status_label.pack(fill=tk.X, pady=(5, 0))
        
        # Button frame
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X, pady=(10, 0))
        
        ttk.Button(button_frame, text="Select All", 
                  command=self.select_all).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Deselect All", 
                  command=self.deselect_all).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Expand All", 
                  command=self.expand_all).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Collapse All", 
                  command=self.collapse_all).pack(side=tk.LEFT, padx=5)
        
        # Output options frame
        output_frame = ttk.LabelFrame(button_frame, text="Output Options")
        output_frame.pack(side=tk.LEFT, padx=20)
        
        self.format_var = tk.StringVar(value="text")
        ttk.Radiobutton(output_frame, text="Plain Text", variable=self.format_var, 
                       value="text").pack(side=tk.LEFT, padx=5)
        ttk.Radiobutton(output_frame, text="Markdown", variable=self.format_var, 
                       value="markdown").pack(side=tk.LEFT, padx=5)
        
        self.clipboard_var = tk.BooleanVar(value=False)
        ttk.Checkbutton(output_frame, text="Copy to Clipboard", 
                       variable=self.clipboard_var).pack(side=tk.LEFT, padx=10)
        
        ttk.Button(button_frame, text="Generate Summary", 
                  command=self.generate_summary).pack(side=tk.RIGHT, padx=5)
    
    def populate_tree(self):
        # Collect files
        files = []
        docker_files = ['dockerfile', 'docker-compose.yml', 'docker-compose.yaml', 'dockerfile.dev']
        
        for root_dir, dirs, filenames in os.walk(self.folder_path):
            # Filter out directories we should ignore (modifies dirs in place)
            dirs[:] = [d for d in dirs if d not in ALWAYS_IGNORE_DIRS]
            
            for filename in filenames:
                ext = os.path.splitext(filename)[1].lower()
                full_path = os.path.join(root_dir, filename)
                
                # Check if path should be ignored
                if should_ignore_path(full_path, self.folder_path):
                    continue
                
                if os.path.isfile(full_path):
                    if ext in self.selected_extensions or (ext == '' and filename.lower() in docker_files):
                        files.append(full_path)
        
        # Organize files by folder
        folder_items = defaultdict(list)
        for file in files:
            rel_path = os.path.relpath(file, self.folder_path)
            folder = os.path.dirname(rel_path)
            folder_items[folder].append(file)
        
        # Create folder structure
        folder_nodes = {}
        for folder in sorted(folder_items.keys()):
            if folder == '':
                continue
            parts = folder.split(os.sep)
            current = ""
            for part in parts:
                parent = current
                current = os.path.join(current, part) if current else part
                if current not in folder_nodes:
                    if parent == "":
                        node = self.tree.insert("", "end", text=part, open=True, 
                                              values=("", "", UNCHECKED), tags=('folder',))
                        folder_nodes[current] = node
                    else:
                        parent_node = folder_nodes.get(parent)
                        node = self.tree.insert(parent_node, "end", text=part, open=True, 
                                              values=("", "", UNCHECKED), tags=('folder',))
                        folder_nodes[current] = node
        
        # Add files to folders
        for folder, items in folder_items.items():
            folder_node = folder_nodes.get(folder, "")
            for idx, file in enumerate(sorted(items)):
                self.add_file_to_tree(file, folder_node, idx % 2 == 0)
        
        # Update folder check states
        for node in folder_nodes.values():
            self.update_folder_check(node)
        
        # Update status
        self.update_status()
    
    def add_file_to_tree(self, file_path, parent_node, use_alternate=False):
        """Add a file to the tree with size and status info"""
        file_name = os.path.basename(file_path)
        file_size = os.path.getsize(file_path)
        size_str = format_file_size(file_size)
        
        # Check if file is new or modified
        status = ""
        tags = ['file']
        current_mtime = os.path.getmtime(file_path)
        
        if file_path in self.previous_file_times:
            if current_mtime > self.previous_file_times[file_path]:
                status = "Modified"
                tags = ['modified_file']  # Replace tags instead of append
        else:
            status = "New"
            tags = ['new_file']  # Replace tags instead of append
        
        # Add alternate row coloring only if not new/modified
        if use_alternate and tags == ['file']:
            tags.append('alternate')
        
        # Check if file was previously selected
        checked = file_path in self.saved_selected_files if self.saved_selected_files else True
        checked_symbol = CHECKED if checked else UNCHECKED
        
        item_id = self.tree.insert(parent_node, "end", text=file_name, 
                                  values=(size_str, status, checked_symbol), 
                                  tags=tuple(tags))
        
        self.item_to_file[item_id] = file_path
        self.file_vars[file_path] = tk.BooleanVar(value=checked)
        self.all_items.append(item_id)
    
    def filter_tree(self, *args):
        """Filter tree based on search text"""
        search_text = self.search_var.get().lower()
        
        if not search_text:
            # Show all items
            for item in self.all_items:
                try:
                    parent = self.tree.parent(item)
                    self.tree.reattach(item, parent, 'end')
                except:
                    pass  # Item might not exist
        else:
            # Hide non-matching items
            for item in self.all_items:
                file_path = self.item_to_file.get(item)
                if file_path:
                    file_name = os.path.basename(file_path).lower()
                    if search_text in file_name or search_text in file_path.lower():
                        try:
                            parent = self.tree.parent(item)
                            self.tree.reattach(item, parent, 'end')
                        except:
                            pass
                    else:
                        try:
                            self.tree.detach(item)
                        except:
                            pass
    
    def is_checked(self, item):
        values = self.tree.item(item, "values")
        return values and len(values) > 2 and values[2] == CHECKED
    
    def update_folder_check(self, item):
        children = self.tree.get_children(item)
        if children:
            folder_checked = all(self.is_checked(child) for child in children)
            self.tree.set(item, "Select", CHECKED if folder_checked else UNCHECKED)
        parent = self.tree.parent(item)
        if parent:
            self.update_folder_check(parent)
    
    def toggle_check(self, event):
        region = self.tree.identify("region", event.x, event.y)
        if region != "cell":
            return
        column = self.tree.identify_column(event.x)
        if column != "#3":  # Select column
            return
        item = self.tree.identify_row(event.y)
        if not item:
            return
        current_state = self.is_checked(item)
        new_state = not current_state
        self.check_children(item, new_state)
        self.update_folder_check(self.tree.parent(item))
        self.update_status()
    
    def check_children(self, item, checked):
        children = self.tree.get_children(item)
        self.tree.set(item, "Select", CHECKED if checked else UNCHECKED)
        for child in children:
            self.check_children(child, checked)
        if not children:  # It's a file
            file_path = self.item_to_file.get(item)
            if file_path:
                self.file_vars[file_path].set(checked)
    
    def on_space(self, event):
        selected_item = self.tree.focus()
        if selected_item:
            current_state = self.is_checked(selected_item)
            new_state = not current_state
            self.check_children(selected_item, new_state)
            self.update_folder_check(self.tree.parent(selected_item))
            self.update_status()
    
    def select_all(self):
        for item in self.tree.get_children():
            self.check_children(item, True)
        self.update_status()
    
    def deselect_all(self):
        for item in self.tree.get_children():
            self.check_children(item, False)
        self.update_status()
    
    def expand_all(self):
        def expand_tree(item):
            self.tree.item(item, open=True)
            for child in self.tree.get_children(item):
                expand_tree(child)
        for item in self.tree.get_children():
            expand_tree(item)
    
    def collapse_all(self):
        def collapse_tree(item):
            self.tree.item(item, open=False)
            for child in self.tree.get_children(item):
                collapse_tree(child)
        for item in self.tree.get_children():
            collapse_tree(item)
    
    def update_status(self):
        """Update status label with selection info"""
        selected = [file for file, var in self.file_vars.items() if var.get()]
        total_size = sum(os.path.getsize(f) for f in selected if os.path.exists(f))
        self.status_label.config(text=f"{len(selected)} files selected ({format_file_size(total_size)} total)")
    
    def generate_summary(self):
        selected = [file for file, var in self.file_vars.items() if var.get()]
        if not selected:
            messagebox.showwarning("No Files Selected", "No files selected. Please select files to include.")
            return
        
        # Save preferences
        prefs = load_preferences()
        if self.folder_path not in prefs:
            prefs[self.folder_path] = {}
        prefs[self.folder_path]['extensions'] = self.selected_extensions
        prefs[self.folder_path]['files'] = selected
        save_preferences(prefs)
        
        # Save file times
        save_file_modified_times(self.folder_path, selected)
        
        # Add to recent folders
        add_to_recent_folders(self.folder_path)
        
        self.selected_files = selected
        self.root.quit()
        self.root.destroy()
        
        # Create summary with selected options
        create_and_save_summary(self.folder_path, selected, 
                              self.format_var.get(), 
                              self.clipboard_var.get())
    
    def run(self):
        self.root.mainloop()
        return self.selected_files

class FolderSelector:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Select Folder")
        self.root.geometry("500x200")
        
        # Center window
        self.root.update_idletasks()
        width = 500
        height = 200
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f'{width}x{height}+{x}+{y}')
        
        self.folder_path = None
        
        self.setup_ui()
    
    def setup_ui(self):
        # Main frame
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Info label
        info_text = "Select a folder to analyze.\n(Common dev files like .git, __pycache__, venv, etc. are automatically excluded)"
        ttk.Label(main_frame, text=info_text, 
                 font=('TkDefaultFont', 10), justify='center').pack(pady=(0, 15))
        
        # Browse button
        ttk.Button(main_frame, text="Browse Folder...", 
                  command=self.browse_folder, width=20).pack(pady=5)
        
        # Recent folders
        recent_folders = get_recent_folders()
        if recent_folders:
            ttk.Label(main_frame, text="Or select a recent folder:").pack(pady=(15, 5))
            
            self.recent_var = tk.StringVar()
            recent_combo = ttk.Combobox(main_frame, textvariable=self.recent_var, 
                                       values=recent_folders, state='readonly', width=50)
            recent_combo.pack(pady=5)
            recent_combo.bind('<<ComboboxSelected>>', self.on_recent_selected)
    
    def browse_folder(self):
        initial_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        folder_path = filedialog.askdirectory(initialdir=initial_dir)
        if folder_path:
            self.folder_path = folder_path
            self.root.quit()
            self.root.destroy()
    
    def on_recent_selected(self, event):
        self.folder_path = self.recent_var.get()
        self.root.quit()
        self.root.destroy()
    
    def run(self):
        self.root.mainloop()
        return self.folder_path

def main():
    # Select folder with options
    folder_selector = FolderSelector()
    folder_path = folder_selector.run()
    
    if not folder_path:
        messagebox.showinfo("No Folder Selected", "No folder was selected. Exiting.")
        logging.info("No folder was selected by the user.")
        return
    
    logging.info(f"Folder selected: {folder_path}")
    
    # Load preferences for this folder with backwards compatibility
    saved_extensions, saved_files = load_folder_preferences(folder_path)
    
    # Select extensions
    if not saved_extensions:
        saved_extensions = get_all_extensions(folder_path)
    
    ext_selector = ExtensionSelector(folder_path, saved_extensions)
    selected_extensions = ext_selector.run()
    
    if not selected_extensions:
        messagebox.showinfo("No Extensions Selected", "No file extensions selected. Exiting.")
        logging.info("User did not select any extensions.")
        return
    
    # Select files (removed respect_gitignore parameter)
    file_selector = FileSelector(folder_path, selected_extensions, saved_files)
    file_selector.run()

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        logging.critical(f"Unhandled exception: {e}", exc_info=True)
        messagebox.showerror("Fatal Error", f"An unexpected error occurred: {e}")