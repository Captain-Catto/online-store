import React from "react";
import { UserNote } from "@/types/user";
import NoteForm from "./NoteForm";
import NoteItem from "./NoteItem";
import LoadingSpinner from "@/components/UI/LoadingSpinner";

interface NotesTabProps {
  notes: UserNote[];
  notesLoading: boolean;
  notesError: string | null;
  newNote: string;
  setNewNote: (value: string) => void;
  editingNote: { id: number; note: string } | null;
  setEditingNote: (note: { id: number; note: string } | null) => void;
  isSubmittingNote: boolean;
  handleAddNote: () => void;
  handleUpdateNote: () => void;
  handleDeleteNote: (noteId: number) => void;
}

const NotesTab = ({
  notes,
  notesLoading,
  notesError,
  newNote,
  setNewNote,
  editingNote,
  setEditingNote,
  isSubmittingNote,
  handleAddNote,
  handleUpdateNote,
  handleDeleteNote,
}: NotesTabProps) => {
  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-3">Ghi chú về khách hàng</h3>

      {/* Form thêm ghi chú */}
      <NoteForm
        newNote={newNote}
        setNewNote={setNewNote}
        handleAddNote={handleAddNote}
        isSubmittingNote={isSubmittingNote}
      />

      {/* Hiển thị danh sách ghi chú */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-700 mb-3">Lịch sử ghi chú</h4>

        {notesLoading ? (
          <div className="text-center py-4">
            <LoadingSpinner size="lg" text="Đang tải ghi chú..." />
          </div>
        ) : notesError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <i className="fas fa-exclamation-circle mr-2"></i> {notesError}
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500">
            <i className="far fa-sticky-note mr-2"></i> Chưa có ghi chú nào về
            khách hàng này
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white border border-gray-200 rounded-md shadow-sm p-4"
              >
                <NoteItem
                  note={note}
                  editingNote={editingNote}
                  setEditingNote={setEditingNote}
                  handleUpdateNote={handleUpdateNote}
                  handleDeleteNote={handleDeleteNote}
                  isSubmittingNote={isSubmittingNote}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesTab;
