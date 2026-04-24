import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Save, Plus, Trash2, GripVertical, Upload, Video, ImageIcon,
  Loader2, AlertCircle, CheckCircle, ChevronDown, ChevronUp
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function InputField({ label, name, value, onChange, type = 'text', placeholder, required, note }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-1.5">
        {label} {note && <span className="text-zinc-500 font-normal">{note}</span>}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={type === 'number' ? 0 : undefined}
        className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Lecture Row
// ─────────────────────────────────────────────────────────────────────────────
function LectureRow({ lecture, courseId, onVideoUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const fileRef = useRef();

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg('');
    try {
      // POST /api/creator/course/:courseId/lecture/:lectureId/video
      // MUST use FormData + multipart/form-data (multer expects field name "file")
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post(
        `/creator/course/${courseId}/lecture/${lecture.id}/video`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setUploadMsg('Video uploaded!');
      onVideoUploaded(lecture.id, res.data.data);
    } catch (err) {
      setUploadMsg(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 p-3 rounded-lg group">
      <GripVertical className="w-4 h-4 text-zinc-600 cursor-move flex-shrink-0" />
      <div className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 flex-shrink-0">
        {lecture.video_url ? (
          <CheckCircle className="w-4 h-4 text-emerald-400" />
        ) : (
          <Video className="w-4 h-4 text-indigo-400" />
        )}
      </div>
      <span className="text-sm text-zinc-300 flex-1">{lecture.title}</span>

      {/* Video upload trigger */}
      <div>
        <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md text-zinc-300 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          {lecture.video_url ? 'Replace Video' : 'Upload Video'}
        </button>
        {uploadMsg && (
          <p className={`text-xs mt-1 ${uploadMsg.includes('!') ? 'text-emerald-400' : 'text-red-400'}`}>{uploadMsg}</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function CourseEditor() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const isNew = courseId === 'new';
  const thumbnailRef = useRef();

  // Course basic fields
  const [form, setForm] = useState({ title: '', description: '', price: '' });
  const [sections, setSections] = useState([]);

  // New section / lecture inputs (per section)
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newLectureInputs, setNewLectureInputs] = useState({}); // { sectionId: { title, isPreview } }
  const [expandedSections, setExpandedSections] = useState({});

  // UI state
  const [savedCourseId, setSavedCourseId] = useState(isNew ? null : parseInt(courseId));
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [addingSectionLoading, setAddingSectionLoading] = useState(false);
  const [addingLectureLoading, setAddingLectureLoading] = useState({});

  // Load existing course data
  useEffect(() => {
    if (isNew) return;
    const loadCourse = async () => {
      setLoading(true);
      try {
        // GET /api/creator/courses/:courseId/sections
        const sectionsRes = await api.get(`/creator/courses/${courseId}/sections`);
        const sectionData = sectionsRes.data.data || [];

        // Load lectures for each section
        const sectionsWithLectures = await Promise.all(
          sectionData.map(async (s) => {
            const lecRes = await api.get(`/creator/sections/${s.id}/lectures`);
            return { ...s, lectures: lecRes.data.data || [] };
          })
        );
        setSections(sectionsWithLectures);

        // Also fetch course list to get this course's details from dashboard
        const dashRes = await api.get('/creator/dashboard');
        const thisCourse = dashRes.data.data?.courses?.find((c) => c.id === parseInt(courseId));
        if (thisCourse) {
          setForm({ title: thisCourse.title, description: thisCourse.description || '', price: thisCourse.price });
          setIsPublished(thisCourse.is_published);
        }
      } catch (err) {
        setError('Failed to load course data.');
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [courseId, isNew]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ── Save / Create Course ──────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      if (isNew || !savedCourseId) {
        // POST /api/creator/course
        // Body: { title, description?, price }
        // multer expects FormData even if no file (backend uses upload.single("file"))
        const formData = new FormData();
        formData.append('title', form.title);
        if (form.description) formData.append('description', form.description);
        formData.append('price', form.price);
        const res = await api.post('/creator/course', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const newId = res.data.data.id;
        setSavedCourseId(newId);
        navigate(`/creator/course/${newId}`, { replace: true });
        setSuccessMsg('Course created! Add sections below.');
      } else {
        // PATCH /api/creator/course/:courseId
        const formData = new FormData();
        if (form.title) formData.append('title', form.title);
        if (form.description) formData.append('description', form.description);
        if (form.price !== '') formData.append('price', form.price);
        await api.patch(`/creator/course/${savedCourseId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccessMsg('Course saved!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course.');
    } finally {
      setSaving(false);
    }
  };

  // ── Thumbnail Upload ──────────────────────────────────────────────────────
  const handleThumbnail = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !savedCourseId) return;
    setThumbnailUploading(true);
    try {
      // POST /api/creator/course/:courseId/thumbnail
      // MUST use FormData + multipart/form-data (field name: "file")
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/creator/course/${savedCourseId}/thumbnail`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccessMsg('Thumbnail uploaded!');
    } catch (err) {
      setError(err.response?.data?.message || 'Thumbnail upload failed.');
    } finally {
      setThumbnailUploading(false);
    }
  };

  // ── Add Section ───────────────────────────────────────────────────────────
  const handleAddSection = async () => {
    if (!newSectionTitle.trim() || !savedCourseId) return;
    setAddingSectionLoading(true);
    try {
      // POST /api/creator/course/:courseId/section → { data: section }
      // Body: { title }
      const res = await api.post(`/creator/course/${savedCourseId}/section`, {
        title: newSectionTitle.trim(),
      });
      const newSection = { ...res.data.data, lectures: [] };
      setSections((p) => [...p, newSection]);
      setExpandedSections((p) => ({ ...p, [newSection.id]: true }));
      setNewSectionTitle('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add section.');
    } finally {
      setAddingSectionLoading(false);
    }
  };

  // ── Add Lecture ───────────────────────────────────────────────────────────
  const handleAddLecture = async (section) => {
    const input = newLectureInputs[section.id] || { title: '', isPreview: false };
    if (!input.title.trim() || !savedCourseId) return;
    setAddingLectureLoading((p) => ({ ...p, [section.id]: true }));
    try {
      // POST /api/creator/course/:courseId/lecture
      // Body: { title, sectionId, isPreview? }
      // multer on this route — backend uses upload.single("file"), send FormData
      const formData = new FormData();
      formData.append('title', input.title.trim());
      formData.append('sectionId', section.id);
      formData.append('isPreview', input.isPreview ? 'true' : 'false');
      const res = await api.post(`/creator/course/${savedCourseId}/lecture`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newLecture = res.data.data;
      setSections((p) =>
        p.map((s) => s.id === section.id ? { ...s, lectures: [...s.lectures, newLecture] } : s)
      );
      setNewLectureInputs((p) => ({ ...p, [section.id]: { title: '', isPreview: false } }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add lecture.');
    } finally {
      setAddingLectureLoading((p) => ({ ...p, [section.id]: false }));
    }
  };

  const onVideoUploaded = (lectureId, updatedLecture) => {
    setSections((p) =>
      p.map((s) => ({
        ...s,
        lectures: s.lectures.map((l) => l.id === lectureId ? { ...l, ...updatedLecture } : l),
      }))
    );
  };

  // ── Publish / Unpublish ───────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!savedCourseId) return;
    setPublishing(true);
    setError('');
    try {
      // PATCH /api/creator/course/:courseId/publish
      await api.patch(`/creator/course/${savedCourseId}/publish`);
      setIsPublished(true);
      setSuccessMsg('Course published!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish.');
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!savedCourseId) return;
    setPublishing(true);
    setError('');
    try {
      // PATCH /api/creator/course/:courseId/unpublish
      await api.patch(`/creator/course/${savedCourseId}/unpublish`);
      setIsPublished(false);
      setSuccessMsg('Course unpublished.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unpublish.');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  );

  const totalLectures = sections.reduce((a, s) => a + s.lectures.length, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{isNew ? 'New Course' : 'Edit Course'}</h1>
          <p className="text-zinc-400 mt-1">{isNew ? 'Fill in the details to create your course.' : `ID: ${savedCourseId}`}</p>
        </div>
      </div>

      {/* Global messages */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-3 mb-6 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl px-5 py-3 mb-6 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />{successMsg}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ── Left Column ── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Details */}
          <form onSubmit={handleSave} className="glass-card p-7">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-zinc-800 pb-4">Basic Details</h2>
            <div className="space-y-5">
              <InputField label="Course Title" name="title" value={form.title} onChange={handleFormChange} placeholder="e.g. Advanced React Patterns" required />
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description <span className="text-zinc-500">(optional)</span></label>
                <textarea
                  name="description"
                  rows={4}
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="What will students learn in this course?"
                  className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all"
                />
              </div>
              <InputField label="Price (USD)" name="price" type="number" value={form.price} onChange={handleFormChange} placeholder="0" required note="(0 = free)" />
            </div>
            <div className="mt-6 flex items-center gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg transition-all"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isNew ? 'Create Course' : 'Save Changes'}
              </button>

              {/* Thumbnail */}
              {savedCourseId && (
                <div>
                  <input ref={thumbnailRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnail} />
                  <button
                    type="button"
                    onClick={() => thumbnailRef.current?.click()}
                    disabled={thumbnailUploading}
                    className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50"
                  >
                    {thumbnailUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    Upload Thumbnail
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Curriculum Builder — only shown after course is created */}
          {savedCourseId && (
            <div className="glass-card p-7">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-zinc-800 pb-4">Curriculum</h2>

              {/* Sections */}
              <div className="space-y-5 mb-8">
                {sections.map((section) => (
                  <div key={section.id} className="border border-zinc-800 bg-zinc-900/30 rounded-xl overflow-hidden">
                    {/* Section header */}
                    <div className="bg-zinc-800/40 px-4 py-3 flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-zinc-600 cursor-move" />
                      <span className="font-semibold text-zinc-100 flex-1">{section.title}</span>
                      <span className="text-xs text-zinc-500">{section.lectures.length} lectures</span>
                      <button onClick={() => setExpandedSections((p) => ({ ...p, [section.id]: !p[section.id] }))} className="text-zinc-500 hover:text-white">
                        {expandedSections[section.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {expandedSections[section.id] && (
                      <div className="p-4 space-y-3">
                        {/* Lecture rows */}
                        {section.lectures.map((lecture) => (
                          <LectureRow key={lecture.id} lecture={lecture} courseId={savedCourseId} onVideoUploaded={onVideoUploaded} />
                        ))}

                        {/* Add lecture form */}
                        <div className="flex items-center gap-2 mt-3">
                          <input
                            type="text"
                            value={newLectureInputs[section.id]?.title || ''}
                            onChange={(e) => setNewLectureInputs((p) => ({ ...p, [section.id]: { ...p[section.id], title: e.target.value } }))}
                            placeholder="New lecture title…"
                            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={newLectureInputs[section.id]?.isPreview || false}
                              onChange={(e) => setNewLectureInputs((p) => ({ ...p, [section.id]: { ...p[section.id], isPreview: e.target.checked } }))}
                              className="accent-indigo-500"
                            />
                            Preview
                          </label>
                          <button
                            type="button"
                            onClick={() => handleAddLecture(section)}
                            disabled={addingLectureLoading[section.id]}
                            className="flex items-center gap-1 text-sm bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {addingLectureLoading[section.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add section */}
              <div className="flex items-center gap-3 border-t border-zinc-800 pt-6">
                <input
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="New section title…"
                  className="flex-1 bg-zinc-900/50 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddSection}
                  disabled={addingSectionLoading}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                >
                  {addingSectionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add Section
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column ── */}
        {savedCourseId && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-bold text-white mb-4 border-b border-zinc-800 pb-3">Publishing</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Status</span>
                  <span className={`px-2.5 py-1 rounded-full font-medium border text-xs ${
                    isPublished
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  }`}>
                    {isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Sections</span>
                  <span className="text-white font-medium">{sections.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Lectures</span>
                  <span className="text-white font-medium">{totalLectures}</span>
                </div>

                <div className="pt-2">
                  {isPublished ? (
                    <button
                      onClick={handleUnpublish}
                      disabled={publishing}
                      className="w-full py-2.5 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                      {publishing && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Unpublish
                    </button>
                  ) : (
                    <button
                      onClick={handlePublish}
                      disabled={publishing || sections.length === 0}
                      className="w-full py-2.5 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                      {publishing && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Publish Course
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
