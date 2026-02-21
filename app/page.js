"use client";

import { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Trash2, Plus, Edit2, Check, X } from 'lucide-react';
import clsx from 'clsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];

export default function Home() {
  const [plan, setPlan, isLoaded] = useLocalStorage('meal-plan', {});
  const [editing, setEditing] = useState(null); // { day, meal }
  const [editValue, setEditValue] = useState("");

  // Initialize empty plan if needed
  useEffect(() => {
    if (isLoaded && Object.keys(plan).length === 0) {
      const initialPlan = {};
      DAYS.forEach(day => {
        initialPlan[day] = {};
        MEALS.forEach(meal => {
          initialPlan[day][meal] = "";
        });
      });
      setPlan(initialPlan);
    }
  }, [isLoaded, plan, setPlan]);

  if (!isLoaded) return null;

  // Stats
  let totalPlanned = 0;
  let totalSlots = DAYS.length * MEALS.length;
  
  DAYS.forEach(day => {
    if (plan[day]) {
      MEALS.forEach(meal => {
        if (plan[day][meal] && plan[day][meal].trim() !== "") {
          totalPlanned++;
        }
      });
    }
  });
  
  const emptySlots = totalSlots - totalPlanned;

  const startEditing = (day, meal) => {
    setEditing({ day, meal });
    setEditValue(plan[day]?.[meal] || "");
  };

  const saveEdit = () => {
    if (!editing) return;
    const { day, meal } = editing;
    setPlan({
      ...plan,
      [day]: {
        ...plan[day],
        [meal]: editValue
      }
    });
    setEditing(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditValue("");
  };

  const deleteMeal = (day, meal) => {
    if (confirm('Clear this meal?')) {
      setPlan({
        ...plan,
        [day]: {
          ...plan[day],
          [meal]: ""
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20">
      {/* Header / Dashboard */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-indigo-900 mb-4">Weekly Meal Planner</h1>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-indigo-600">{totalPlanned}</span>
              <span className="text-xs text-indigo-800 font-medium uppercase tracking-wider">Planned</span>
            </div>
            <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-orange-600">{emptySlots}</span>
              <span className="text-xs text-orange-800 font-medium uppercase tracking-wider">Empty</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {DAYS.map(day => (
            <div key={day} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 flex justify-between items-center">
                {day}
              </div>
              <div className="divide-y divide-gray-100">
                {MEALS.map(meal => {
                  const isEditingThis = editing?.day === day && editing?.meal === meal;
                  const currentMealValue = plan[day]?.[meal] || "";
                  const hasMeal = currentMealValue.trim() !== "";

                  return (
                    <div key={meal} className="p-4 group">
                      <div className="text-xs font-bold text-gray-400 uppercase mb-1 tracking-wide">{meal}</div>
                      
                      {isEditingThis ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 border border-indigo-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder={`What for ${meal}?`}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit();
                              if (e.key === 'Escape') cancelEdit();
                            }}
                          />
                          <button onClick={saveEdit} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={cancelEdit} className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2 min-h-[32px]">
                          <div 
                            className={clsx(
                              "text-sm flex-1 break-words cursor-pointer py-1",
                              !hasMeal && "text-gray-400 italic"
                            )}
                            onClick={() => startEditing(day, meal)}
                          >
                            {hasMeal ? currentMealValue : "Plan a meal..."}
                          </div>
                          
                          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity items-center gap-1">
                            <button 
                              onClick={() => startEditing(day, meal)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md"
                              title="Edit"
                            >
                              {hasMeal ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            </button>
                            {hasMeal && (
                              <button 
                                onClick={() => deleteMeal(day, meal)}
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                                title="Clear"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}