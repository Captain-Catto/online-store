import React from "react";
import { UserNote } from "@/types/user";
import { formatDateDisplay } from "@/utils/dateUtils";

interface NoteItemProps {
  note: UserNote;
  editingNote: { id: number; note: string } | null;
  setEditingNote: (note: { id: number; note: string } | null) => void;
  handleUpdateNote: () => void;
  handleDeleteNote: (noteId: number) => void;
  isSubmittingNote: boolean;
}

const NoteItem = ({
  note,
  editingNote,
  setEditingNote,
  handleUpdateNote,
  handleDeleteNote,
  isSubmittingNote,
}: NoteItemProps) => {
  const handleCancelEdit = () => {
    setEditingNote(null);
  };

  if (editingNote && editingNote.id === note.id) {
    return (
      <div className="space-y-3">
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          value={editingNote.note}
          onChange={(e) =>
            setEditingNote({
              ...editingNote,
              note: e.target.value,
            })
          }
          disabled={isSubmittingNote}
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            onClick={handleCancelEdit}
            disabled={isSubmittingNote}
          >
            Hủy
          </button>
          <button
            type="button"
            className={`px-3 py-1 ${
              !editingNote.note.trim() || isSubmittingNote
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white rounded-md`}
            onClick={handleUpdateNote}
            disabled={!editingNote.note.trim() || isSubmittingNote}
          >
            {isSubmittingNote ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-start">
        <p className="text-gray-800">{note.note}</p>
        <div className="flex gap-2">
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800"
            onClick={() =>
              setEditingNote({
                id: note.id,
                note: note.note,
              })
            }
            disabled={isSubmittingNote}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            type="button"
            className="text-red-600 hover:text-red-800"
            onClick={() => handleDeleteNote(note.id)}
            disabled={isSubmittingNote}
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        <span>{formatDateDisplay(note.createdAt)}</span>
        {note.createdAt !== note.updatedAt && (
          <span> (Đã chỉnh sửa {formatDateDisplay(note.updatedAt)})</span>
        )}
      </div>
    </>
  );
};

export default NoteItem;
