// src/components/ShiftSlot.js
import React, { useState, useEffect } from 'react';
import { generateTimeOptions } from '../utils/generateTimeOptions';

export default function ShiftSlot({
    staffId,
    dayIndex,
    shift,
    onShiftsChange,
    staffShifts,
    weekId,
    comment,
    onAddComment,
    onDeleteComment,
}) {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [newComment, setNewComment] = useState('');
    const timeOptions = generateTimeOptions();
    const [isShiftAdded, setIsShiftAdded] = useState(shift !== 'OFF');

    // Update local state when shift prop changes
    useEffect(() => {
        if (shift && shift !== 'OFF') {
            const [start, end] = shift.split('-').map((s) => s.trim());
            setStartTime(start);
            setEndTime(end);
            setIsShiftAdded(true);
        } else {
            setStartTime('');
            setEndTime('');
            setIsShiftAdded(false);
        }
    }, [shift]);

    const handleStartTimeChange = (event) => {
        const newStartTime = event.target.value;
        setStartTime(newStartTime);
        if (newStartTime && endTime) {
            updateShiftIfValid(newStartTime, endTime);
        }
    };

    const handleEndTimeChange = (event) => {
        const newEndTime = event.target.value;
        setEndTime(newEndTime);
        if (startTime && newEndTime) {
            updateShiftIfValid(startTime, newEndTime);
        }
    };

    const parseTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map((x) => parseInt(x, 10));
        if (isNaN(hours) || isNaN(minutes)) return null;
        return hours + minutes / 60;
    };

    const updateShiftIfValid = (start, end) => {
        if (!start || !end) return;

        const startVal = parseTime(start);
        const endVal = parseTime(end);

        if (startVal >= endVal) {
            alert('End time must be after start time.');
            return;
        }

        const updateFn = (prevShifts) => {
            if (!Array.isArray(prevShifts)) {
                prevShifts = Array(7).fill('OFF');
            }
            const newShifts = [...prevShifts];
            newShifts[dayIndex] = `${start} - ${end}`;
            return newShifts;
        };

        onShiftsChange(weekId, staffId, dayIndex, updateFn);
        setIsShiftAdded(true);
    };

    const handleRemoveShift = () => {
        const updateFn = (prevShifts) => {
            if (!Array.isArray(prevShifts)) {
                prevShifts = Array(7).fill('OFF');
            }
            const newShifts = [...prevShifts];
            newShifts[dayIndex] = 'OFF';
            return newShifts;
        };
        onShiftsChange(weekId, staffId, dayIndex, updateFn);
        setIsShiftAdded(false);
        setStartTime('');
        setEndTime('');
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (newComment.trim()) {
            onAddComment(newComment.trim());
            setNewComment('');
            setShowCommentInput(false);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex flex-col gap-2 w-full">
            {/* Shift Display */}
            {isShiftAdded ? (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 bg-gray-200 rounded px-2 py-1 text-sm w-fit shift-slot-chip">
                        <span>{`${startTime} - ${endTime}`}</span>
                        <button
                            onClick={handleRemoveShift}
                            className="text-red-500 ml-1 hover:text-red-700"
                        >
                            ×
                        </button>
                    </div>

                    {/* Comment Section */}
                    <div className="mt-2">
                        {comment ? (
                            <div className="bg-blue-50 p-2 rounded text-sm mb-1 relative group">
                                <p className="pr-6">{comment.text}</p>
                                <span className="text-xs text-gray-500">{formatTimestamp(comment.timestamp)}</span>
                                <button
                                    onClick={onDeleteComment}
                                    className="absolute top-1 right-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ×
                                </button>
                            </div>
                        ) : showCommentInput ? (
                            <form onSubmit={handleCommentSubmit} className="mt-1">
                                <div className="flex gap-1">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="flex-1 px-2 py-1 text-sm border rounded"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCommentInput(false)}
                                        className="px-2 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <button
                                onClick={() => setShowCommentInput(true)}
                                className="text-blue-500 text-sm hover:text-blue-600"
                            >
                                + Add Comment
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex gap-2">
                    <select
                        value={startTime}
                        onChange={handleStartTimeChange}
                        className="p-1 text-sm border rounded"
                    >
                        <option value="">Start</option>
                        {timeOptions.map((time) => (
                            <option key={time} value={time}>
                                {time}
                            </option>
                        ))}
                    </select>
                    <select
                        value={endTime}
                        onChange={handleEndTimeChange}
                        className="p-1 text-sm border rounded"
                    >
                        <option value="">End</option>
                        {timeOptions.map((time) => (
                            <option key={time} value={time}>
                                {time}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}