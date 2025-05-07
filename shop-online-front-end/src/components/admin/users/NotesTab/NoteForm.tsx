import React from "react";

interface NoteFormProps {
  newNote: string;
  setNewNote: (value: string) => void;
  handleAddNote: () => void;
  isSubmittingNote: boolean;
}

const NoteForm = ({
  newNote,
  setNewNote,
  handleAddNote,
  isSubmittingNote,
}: NoteFormProps) => {
  return (
    <div className="mb-6">
      <label
        htmlFor="newNote"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Thêm ghi chú mới
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          id="newNote"
          className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"
          placeholder="Nhập ghi chú về khách hàng này..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          disabled={isSubmittingNote}
        />
        <button
          type="button"
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            !newNote.trim() || isSubmittingNote
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          }`}
          onClick={handleAddNote}
          disabled={!newNote.trim() || isSubmittingNote}
        >
          {isSubmittingNote ? "Đang lưu..." : "Lưu ghi chú"}
        </button>
      </div>
    </div>
  );
};

export default NoteForm;
