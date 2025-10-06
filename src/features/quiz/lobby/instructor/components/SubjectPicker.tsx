import { InputFieldQuizz } from "@/features/quiz/components/ui/input-field-quizz";
import { IBank } from "@/types/bank";
import { motion } from "framer-motion";
import { BookmarkCheck, CheckCircle, Search, X } from "lucide-react";
import { useState, useMemo } from "react";

type SubjectPickerProps = {
  subjects: IBank[];
  selectedBankId: number | null;
  handleSubjectSelect: (bankId: number) => void;
  isSubjectLoading: boolean;
};

export const SubjectPicker: React.FC<SubjectPickerProps> = ({
  subjects,
  selectedBankId,
  handleSubjectSelect,
  isSubjectLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return subjects;

    const query = searchQuery.toLowerCase();
    return subjects.filter((subject) =>
      subject.title.toLowerCase().includes(query)
    );
  }, [subjects, searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <motion.div className="bg-white border-2 border-blue-100 rounded-2xl p-6 shadow-xl">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <BookmarkCheck className="w-5 h-5 text-blue-600" />
        Pick Your Subject!
      </h3>

      <motion.div
        className="mb-4 relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
        whileHover={{ scale: 1.02 }}
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <InputFieldQuizz
          type="text"
          placeholder="Search subjects..."
          value={searchQuery}
          className="pl-10"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>

      {searchQuery && (
        <div className="mb-3 text-sm text-gray-600">
          Found {filteredSubjects.length} subject
          {filteredSubjects.length !== 1 ? "s" : ""}
        </div>
      )}

      <div className="space-y-2.5 overflow-y-auto max-h-[120px] pr-1 custom-scrollbar">
        {isSubjectLoading ? (
          <div className="text-center text-gray-500 py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2">Loading subjects...</p>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="font-medium">No subjects found</p>
            {searchQuery && (
              <p className="text-sm mt-1">Try a different search term</p>
            )}
          </div>
        ) : (
          filteredSubjects.map((subject, index) => (
            <motion.div
              key={subject.id}
              className={`cursor-pointer border rounded-lg p-3.5 transition-all ${
                selectedBankId === subject.id
                  ? "bg-blue-600 border-blue-800 text-white shadow-md"
                  : "bg-blue-50 border-blue-100 hover:bg-blue-100 hover:border-blue-200"
              }`}
              whileHover={{ scale: 1.01, x: 2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleSubjectSelect(subject.id)}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
                delay: 0 + index * 0.1,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <span
                    className={`font-semibold block truncate ${
                      selectedBankId === subject.id
                        ? "text-white"
                        : "text-gray-800"
                    }`}
                  >
                    {subject.title} ({subject.type} - {subject.category})
                  </span>
                </div>
                {selectedBankId === subject.id && (
                  <CheckCircle className="w-5 h-5 ml-2 flex-shrink-0" />
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </motion.div>
  );
};
