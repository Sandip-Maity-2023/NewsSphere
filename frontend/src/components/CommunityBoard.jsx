// import { useEffect, useMemo, useState } from "react";

// const rawApiBase = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// const normalizeBase = (raw) => {
//   if (!raw) return "http://localhost:5000";
//   const trimmed = String(raw).trim();
//   // If it's like ":5000" (missing host), assume localhost
//   if (trimmed.startsWith(":")) return `http://localhost${trimmed}`;
//   // If it has protocol, return without trailing slash
//   if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/$/, "");
//   // If it's just a port (e.g. "5000") or host:port, add http://
//   return `http://${trimmed.replace(/\/$/, "")}`;
// };

// const API_BASE = normalizeBase(rawApiBase);

// const emptyComposer = {
//   title: "",
//   content: "",
//   mediaType: "text",
//   mediaUrl: "",
//   mediaName: "",
// };

// const formatDate = (value) => {
//   if (!value) return "Just now";
//   const date = new Date(String(value));
//   return Number.isNaN(date.getTime())
//     ? "Just now"
//     : date.toLocaleString(undefined, {
//         month: "short",
//         day: "numeric",
//         hour: "numeric",
//         minute: "2-digit",
//       });
// };

// const CommunityBoard = ({ user }) => {
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [composerOpen, setComposerOpen] = useState(true);
//   const [composer, setComposer] = useState(emptyComposer);
//   const [fileUploading, setFileUploading] = useState(false);
//   const [commentDrafts, setCommentDrafts] = useState({});

//   const authorName = useMemo(
//     () => user?.displayName || user?.email?.split("@")[0] || "Anonymous",
//     [user],
//   );



//   useEffect(() => {
//     let mounted = true;

//     const init = async () => {
//       if (mounted) {
//         await loadPosts();
//       }
//     };

//     init();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const setField = (field, value) => {
//     setComposer((current) => ({ ...current, [field]: value }));
//   };

//   const handleFileChange = async (event) => {
//     setError("");
//     const file = event.target.files?.[0];

//     if (!file) {
//       setField("mediaUrl", "");
//       setField("mediaName", "");
//       return;
//     }

//     const MAX_FILE_SIZE = 5 * 1024 * 1024;

//     if (file.size > MAX_FILE_SIZE) {
//       setError("File size must be under 5 MB.");
//       return;
//     }

//     if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
//       setError("Only image and video files are allowed.");
//       return;
//     }

//     setFileUploading(true);

//     try {
//       const mediaType = file.type.startsWith("video/") ? "video" : "image";

//       const mediaUrl = await new Promise((resolve, reject) => {
//         const reader = new FileReader();

//         reader.onload = () => resolve(String(reader.result || ""));

//         reader.onerror = () => reject(new Error("Unable to read media file."));

//         reader.readAsDataURL(file);
//       });

//       setComposer((current) => ({
//         ...current,
//         mediaType,
//         mediaUrl,
//         mediaName: file.name,
//       }));

//       setError("");
//     } catch (readError) {
//       setError(readError.message || "Unable to read media file.");
//     } finally {
//       setFileUploading(false);
//     }
//   };

//   const fetchWithTimeout = async (url, options = {}, timeout = 30000) => {
//     const controller = new AbortController();

//     const timeoutId = setTimeout(() => {
//       controller.abort();
//     }, timeout);

//     try {
//       return await fetch(url, {
//         ...options,
//         signal: controller.signal,
//       });
//     } finally {
//       clearTimeout(timeoutId);
//     }
//   };

//   const loadPosts = async () => {
//     setLoading(true);
//     setError("");

//     try {
//       const response = await fetchWithTimeout(`${API_BASE}/api/posts`);

//       if (!response.ok) {
//         throw new Error("Unable to load community posts.");
//       }

//       const data = await response.json();
//       setPosts(Array.isArray(data) ? data : []);
//     } catch (fetchError) {
//       if (fetchError.name === "AbortError") {
//         setError("Request timed out. Please try again.");
//         return;
//       }

//       setError(fetchError.message || "Unable to load community posts.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const submitPost = async (event) => {
//     event.preventDefault();

//     if (
//       !composer.title.trim() &&
//       !composer.content.trim() &&
//       !composer.mediaUrl
//     ) {
//       setError("Add a confession, image, or video before posting.");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       const response = await fetchWithTimeout(`${API_BASE}/api/posts`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           ...composer,
//           authorId: user?.uid || "",
//           authorName,
//           authorEmail: user?.email || "",
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || "Unable to create post.");
//       }

//       setPosts((current) => [data, ...current]);
//       setComposer({
//         title: "",
//         content: "",
//         mediaType: "text",
//         mediaUrl: "",
//         mediaName: "",
//       });
//       setComposerOpen(false);
//     } catch (submitError) {
//       setError(submitError.message || "Unable to create post.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const likePost = async (postId) => {
//     try {
//       const response = await fetchWithTimeout(
//         `${API_BASE}/api/posts/${postId}/like`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//         },
//       );
//       const data = await response.json();

//       if (!response.ok) throw new Error(data.error || "Unable to like post.");

//       setPosts((current) =>
//         current.map((post) => (post._id === postId ? data : post)),
//       );
//     } catch (likeError) {
//       setError(likeError.message || "Unable to like post.");
//     }
//   };

//   const submitComment = async (postId) => {
//     const commentText = (commentDrafts[postId] || "").trim();
//     if (!commentText) return;

//     try {
//       const response = await fetchWithTimeout(
//         `${API_BASE}/api/posts/${postId}/comments`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             name: authorName,
//             text: commentText,
//           }),
//         },
//       );

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.error || "Unable to add comment.");

//       setPosts((current) =>
//         current.map((post) => (post._id === postId ? data : post)),
//       );
//       setCommentDrafts((current) => ({ ...current, [postId]: "" }));
//     } catch (commentError) {
//       setError(commentError.message || "Unable to add comment.");
//     }
//   };

//   const deletePost = async (post) => {
//     const confirmDelete = window.confirm("Delete this post?");
//     if (!confirmDelete) return;

//     try {
//       const response = await fetchWithTimeout(
//         `${API_BASE}/api/posts/${post._id}`,
//         {
//           method: "DELETE",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ authorId: user?.uid || "" }),
//         },
//       );

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.error || "Unable to delete post.");

//       setPosts((current) => current.filter((item) => item._id !== post._id));
//     } catch (deleteError) {
//       if (deleteError.name === "AbortError") {
//         setError("Request timed out. Please try again.");
//         return;
//       }

//       setError(deleteError.message || "Unable to delete post.");
//     }
//   };

//   const userOwnsPost = (post) =>
//     Boolean(user?.uid && post.authorId && user.uid === post.authorId);

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         padding: "88px 20px 36px",
//         background:
//           "linear-gradient(180deg, #0f172a 0%, #111827 22%, #f8fafc 22%, #f8fafc 100%)",
//       }}
//     >
//       <div
//         style={{
//           maxWidth: "1180px",
//           margin: "0 auto",
//         }}
//       >
//         <section
//           style={{
//             color: "#fff",
//             padding: "28px",
//             borderRadius: "28px",
//             background:
//               "radial-gradient(circle at top right, rgba(59, 130, 246, 0.32), transparent 26%), linear-gradient(135deg, #0f172a, #1d4ed8)",
//             boxShadow: "0 24px 60px rgba(15, 23, 42, 0.25)",
//             marginBottom: "22px",
//           }}
//         >
//           <p style={{ margin: 0, opacity: 0.78, letterSpacing: "0.08em" }}>
//             COMMUNITY WALL
//           </p>
//           <h1 style={{ margin: "8px 0 10px", fontSize: "2.3rem" }}>
//             Share confessions, photos, and video posts
//           </h1>
//           <p
//             style={{
//               margin: 0,
//               maxWidth: "720px",
//               lineHeight: 1.6,
//               opacity: 0.9,
//             }}
//           >
//             Posts are stored in MongoDB. Everyone can browse the feed, like
//             posts, comment, and remove their own content while the third-party
//             news feed stays separate.
//           </p>

//           <div style={{ marginTop: "18px" }}>
//             <button
//               onClick={() => setComposerOpen((current) => !current)}
//               style={{
//                 background: "#fff",
//                 color: "#0f172a",
//                 border: "none",
//                 padding: "12px 18px",
//                 borderRadius: "999px",
//                 fontWeight: 800,
//                 cursor: "pointer",
//                 boxShadow: "0 14px 30px rgba(15, 23, 42, 0.2)",
//               }}
//             >
//               {composerOpen ? "Hide Post Form" : "Create Post"}
//             </button>
//           </div>
//         </section>

//         {composerOpen && (
//           <form
//             onSubmit={submitPost}
//             style={{
//               background: "rgba(255,255,255,0.94)",
//               borderRadius: "24px",
//               padding: "22px",
//               boxShadow: "0 14px 40px rgba(15, 23, 42, 0.12)",
//               border: "1px solid rgba(148, 163, 184, 0.25)",
//               marginBottom: "22px",
//             }}
//           >
//             <div style={{ display: "grid", gap: "14px" }}>
//               <input
//                 placeholder="Post title"
//                 value={composer.title}
//                 onChange={(event) => setField("title", event.target.value)}
//                 style={inputStyle}
//               />
//               <textarea
//                 placeholder="Write a confession or story..."
//                 rows={5}
//                 value={composer.content}
//                 onChange={(event) => setField("content", event.target.value)}
//                 style={{ ...inputStyle, resize: "vertical" }}
//               />

//               <div style={selectRowStyle}>
//                 <label style={labelStyle}>Media type</label>
//                 <select
//                   value={composer.mediaType}
//                   onChange={(event) =>
//                     setField("mediaType", event.target.value)
//                   }
//                   style={selectStyle}
//                 >
//                   <option value="text">Text confession</option>
//                   <option value="image">Image</option>
//                   <option value="video">Video</option>
//                 </select>
//               </div>

//               <label style={uploadLabelStyle}>
//                 {fileUploading ? "Processing file..." : "Upload image or video"}
//                 <input
//                   type="file"
//                   accept="image/*,video/*"
//                   onChange={handleFileChange}
//                   style={{ display: "block", marginTop: "10px" }}
//                 />
//               </label>

//               {composer.mediaUrl && (
//                 <div style={previewBoxStyle}>
//                   <strong style={{ display: "block", marginBottom: "10px" }}>
//                     Preview
//                   </strong>
//                   {composer.mediaType === "video" ? (
//                     <video
//                       src={composer.mediaUrl}
//                       controls
//                       style={{
//                         width: "100%",
//                         borderRadius: "18px",
//                         maxHeight: "360px",
//                       }}
//                     />
//                   ) : (
//                     <img
//                       src={composer.mediaUrl}
//                       alt={composer.mediaName || "preview"}
//                       style={{
//                         width: "100%",
//                         borderRadius: "18px",
//                         objectFit: "cover",
//                       }}
//                     />
//                   )}
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 disabled={loading || fileUploading}
//                 style={{
//                   ...submitButtonStyle,
//                   opacity: loading || fileUploading ? 0.7 : 1,
//                   cursor: loading || fileUploading ? "not-allowed" : "pointer",
//                 }}
//               >
//                 {loading ? "Publishing..." : "Publish Post"}
//               </button>
//             </div>
//           </form>
//         )}

//         {error && (
//           <div
//             style={{
//               marginBottom: "18px",
//               padding: "14px 16px",
//               borderRadius: "16px",
//               background: "#fee2e2",
//               color: "#991b1b",
//               fontWeight: 700,
//             }}
//           >
//             {error}
//           </div>
//         )}

//         {loading && posts.length === 0 ? (
//           <div style={stateCardStyle}>Loading community posts...</div>
//         ) : posts.length === 0 ? (
//           <div style={stateCardStyle}>
//             No community posts yet. Be the first one.
//           </div>
//         ) : (
//           <div style={feedGridStyle}>
//             {posts.map((post) => (
//               <article key={post._id} style={postCardStyle}>
//                 <div style={postHeaderStyle}>
//                   <div>
//                     <p style={metaStyle}>{post.authorName || "Anonymous"}</p>
//                     <h2 style={{ margin: "6px 0 0", color: "#0f172a" }}>
//                       {post.title || "Untitled confession"}
//                     </h2>
//                   </div>

//                   {userOwnsPost(post) && (
//                     <button
//                       onClick={() => deletePost(post)}
//                       style={deleteButtonStyle}
//                     >
//                       Delete
//                     </button>
//                   )}
//                 </div>

//                 {post.content && <p style={contentStyle}>{post.content}</p>}

//                 {post.mediaUrl && post.mediaType === "image" && (
//                   <img
//                     src={post.mediaUrl}
//                     alt={post.title || "post media"}
//                     style={mediaImageStyle}
//                   />
//                 )}

//                 {post.mediaUrl && post.mediaType === "video" && (
//                   <video src={post.mediaUrl} controls style={mediaVideoStyle} />
//                 )}

//                 <div style={actionsRowStyle}>
//                   <button
//                     type="button"
//                     onClick={() => likePost(post._id)}
//                     style={actionButtonStyle}
//                   >
//                     👍 Like · {post.likes || 0}
//                   </button>
//                   <span style={metaStyle}>{formatDate(post.createdAt)}</span>
//                 </div>

//                 <div style={commentBoxStyle}>
//                   <div style={commentListStyle}>
//                     {(post.comments || []).map((comment) => (
//                       <div key={comment._id} style={commentItemStyle}>
//                         <strong>{comment.name}:</strong>{" "}
//                         <span>{comment.text}</span>
//                       </div>
//                     ))}
//                   </div>

//                   <div style={commentFormStyle}>
//                     <input
//                       placeholder="Add a comment"
//                       value={commentDrafts[post._id] || ""}
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter") {
//                           e.preventDefault();
//                           submitComment(post._id);
//                         }
//                       }}
//                       onChange={(event) =>
//                         setCommentDrafts((current) => ({
//                           ...current,
//                           [post._id]: event.target.value,
//                         }))
//                       }
//                       style={commentInputStyle}
//                     />
//                     <button
//                       type="button"
//                       onClick={() => submitComment(post._id)}
//                       style={commentButtonStyle}
//                     >
//                       Comment
//                     </button>
//                   </div>
//                 </div>
//               </article>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const inputStyle = {
//   width: "100%",
//   padding: "14px 16px",
//   borderRadius: "16px",
//   border: "1px solid #cbd5e1",
//   outline: "none",
//   fontSize: "1rem",
//   background: "#fff",
// };

// const selectRowStyle = {
//   display: "flex",
//   gap: "12px",
//   alignItems: "center",
//   flexWrap: "wrap",
// };

// const labelStyle = {
//   fontWeight: 800,
//   color: "#0f172a",
// };

// const selectStyle = {
//   padding: "12px 14px",
//   borderRadius: "14px",
//   border: "1px solid #cbd5e1",
//   background: "#fff",
// };

// const uploadLabelStyle = {
//   padding: "16px",
//   borderRadius: "18px",
//   border: "1px dashed #94a3b8",
//   background: "#f8fafc",
//   color: "#334155",
//   fontWeight: 700,
// };

// const previewBoxStyle = {
//   background: "#f8fafc",
//   borderRadius: "20px",
//   padding: "16px",
//   border: "1px solid #e2e8f0",
// };

// const submitButtonStyle = {
//   background: "linear-gradient(135deg, #0f172a, #2563eb)",
//   color: "#fff",
//   border: "none",
//   padding: "14px 18px",
//   borderRadius: "16px",
//   cursor: "pointer",
//   fontWeight: 800,
//   fontSize: "1rem",
// };

// const stateCardStyle = {
//   padding: "28px",
//   textAlign: "center",
//   borderRadius: "24px",
//   background: "rgba(255,255,255,0.92)",
//   boxShadow: "0 14px 40px rgba(15, 23, 42, 0.12)",
//   color: "#334155",
// };

// const feedGridStyle = {
//   display: "grid",
//   gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
//   gap: "20px",
// };

// const postCardStyle = {
//   background: "rgba(255,255,255,0.96)",
//   borderRadius: "24px",
//   padding: "20px",
//   boxShadow: "0 16px 42px rgba(15, 23, 42, 0.12)",
//   border: "1px solid rgba(148, 163, 184, 0.2)",
// };

// const postHeaderStyle = {
//   display: "flex",
//   justifyContent: "space-between",
//   gap: "12px",
//   alignItems: "flex-start",
// };

// const deleteButtonStyle = {
//   background: "#fee2e2",
//   color: "#991b1b",
//   border: "none",
//   borderRadius: "999px",
//   padding: "10px 14px",
//   cursor: "pointer",
//   fontWeight: 800,
// };

// const metaStyle = {
//   margin: 0,
//   color: "#64748b",
//   fontSize: "0.9rem",
//   fontWeight: 700,
// };

// const contentStyle = {
//   color: "#1e293b",
//   lineHeight: 1.7,
//   margin: "16px 0",
//   whiteSpace: "pre-wrap",
// };

// const mediaImageStyle = {
//   width: "100%",
//   borderRadius: "20px",
//   marginTop: "8px",
//   objectFit: "cover",
// };

// const mediaVideoStyle = {
//   width: "100%",
//   borderRadius: "20px",
//   marginTop: "8px",
// };

// const actionsRowStyle = {
//   display: "flex",
//   justifyContent: "space-between",
//   gap: "12px",
//   alignItems: "center",
//   marginTop: "16px",
//   flexWrap: "wrap",
// };

// const actionButtonStyle = {
//   background: "#0f172a",
//   color: "#fff",
//   border: "none",
//   borderRadius: "999px",
//   padding: "10px 16px",
//   cursor: "pointer",
//   fontWeight: 800,
// };

// const commentBoxStyle = {
//   marginTop: "18px",
//   paddingTop: "16px",
//   borderTop: "1px solid #e2e8f0",
// };

// const commentListStyle = {
//   display: "grid",
//   gap: "8px",
//   marginBottom: "12px",
// };

// const commentItemStyle = {
//   background: "#f8fafc",
//   padding: "10px 12px",
//   borderRadius: "14px",
//   color: "#334155",
// };

// const commentFormStyle = {
//   display: "flex",
//   gap: "10px",
//   flexWrap: "wrap",
// };

// const commentInputStyle = {
//   flex: 1,
//   minWidth: "180px",
//   padding: "12px 14px",
//   borderRadius: "14px",
//   border: "1px solid #cbd5e1",
// };

// const commentButtonStyle = {
//   padding: "12px 16px",
//   borderRadius: "14px",
//   background: "#2563eb",
//   color: "#fff",
//   border: "none",
//   cursor: "pointer",
//   fontWeight: 800,
// };

// export default CommunityBoard;


import { useEffect, useMemo, useState } from "react";

const rawApiBase = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const normalizeBase = (raw) => {
  if (!raw) return "http://localhost:5000";
  const trimmed = String(raw).trim();
  if (trimmed.startsWith(":")) return `http://localhost${trimmed}`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/$/, "");
  return `http://${trimmed.replace(/\/$/, "")}`;
};

const API_BASE = normalizeBase(rawApiBase);

const emptyComposer = {
  title: "",
  content: "",
  mediaType: "text",
  mediaUrl: "",
  mediaName: "",
};

const formatDate = (value) => {
  if (!value) return "Just now";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime())
    ? "Just now"
    : date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
};

const CommunityBoard = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [composer, setComposer] = useState(emptyComposer);
  const [commentDrafts, setCommentDrafts] = useState({});

  const authorName = useMemo(
    () => user?.displayName || user?.email?.split("@")[0] || "Anonymous",
    [user],
  );

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      loadPosts();
    }
    const refreshId = window.setInterval(() => {
      loadPosts();
    }, 15000);
    return () => {
      mounted = false;
      window.clearInterval(refreshId);
    };
  }, []);

  const setField = (field, value) => {
    setComposer((current) => ({ ...current, [field]: value }));
  };

  // const handleFileChange = async (event) => {
  //   setError("");
  //   const file = event.target.files?.[0];

  //   if (!file) {
  //     setField("mediaUrl", "");
  //     setField("mediaName", "");
  //     return;
  //   }

  //   const MAX_FILE_SIZE = 5 * 1024 * 1024;
  //   if (file.size > MAX_FILE_SIZE) {
  //     setError("File size must be under 5 MB.");
  //     return;
  //   }

  //   if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
  //     setError("Only image and video files are allowed.");
  //     return;
  //   }

  //   setFileUploading(true);

  //   try {
  //     const mediaType = file.type.startsWith("video/") ? "video" : "image";
  //     const mediaUrl = await new Promise((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.onload = () => resolve(String(reader.result || ""));
  //       reader.onerror = () => reject(new Error("Unable to read media file."));
  //       reader.readAsDataURL(file);
  //     });

  //     setComposer((current) => ({
  //       ...current,
  //       mediaType,
  //       mediaUrl,
  //       mediaName: file.name,
  //     }));
  //   } catch (readError) {
  //     setError(readError.message || "Unable to read media file.");
  //   } finally {
  //     setFileUploading(false);
  //   }
  // };

  const handleFileChange = (event) => {
  setError("");
  const file = event.target.files?.[0];

  if (!file) {
    setField("mediaUrl", ""); // Used only for local preview now
    setField("mediaFile", null); // Store the raw file here
    return;
  }

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    setError("File size must be under 5 MB.");
    return;
  }

  const mediaType = file.type.startsWith("video/") ? "video" : "image";
  
  // Create a temporary local URL just so the user can see a preview before uploading
  const localPreviewUrl = URL.createObjectURL(file);

  setComposer((current) => ({
    ...current,
    mediaType,
    mediaUrl: localPreviewUrl, // Temporary preview blob
    mediaFile: file,           // Actual file object sent to server
    mediaName: file.name,
  }));
};

const fetchWithTimeout = async (url, options = {}, timeout = 15000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

  const loadPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchWithTimeout(`${API_BASE}/api/posts`);
      if (!response.ok) throw new Error("Unable to load community posts.");
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError(fetchError.name === "AbortError" ? "Request timed out. Reconnecting..." : fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  // const submitPost = async (event) => {
  //   event.preventDefault();
  //   if (!composer.title.trim() && !composer.content.trim() && !composer.mediaUrl) {
  //     setError("Add a confession, image, or video before posting.");
  //     return;
  //   }

  //   setLoading(true);
  //   setError("");

  //   try {
  //     const response = await fetchWithTimeout(`${API_BASE}/api/posts`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         ...composer,
  //         authorId: user?.uid || "",
  //         authorName,
  //         authorEmail: user?.email || "",
  //       }),
  //     });

  //     const data = await response.json();
  //     if (!response.ok) throw new Error(data.error || "Unable to create post.");

  //     setPosts((current) => [data, ...current]);
  //     setComposer(emptyComposer);
  //     setComposerOpen(false);
  //   } catch (submitError) {
  //     setError(submitError.message || "Unable to create post.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const submitPost = async (event) => {
  event.preventDefault();
  if (!composer.title.trim() && !composer.content.trim() && !composer.mediaFile) {
    setError("Add a confession, image, or video before posting.");
    return;
  }

  setLoading(true);
  setError("");

  try {
    // 1. Create FormData instance
    const formData = new FormData();
    
    // 2. Append standard text fields
    formData.append("title", composer.title);
    formData.append("content", composer.content);
    formData.append("mediaType", composer.mediaType);
    formData.append("authorId", user?.uid || "");
    formData.append("authorName", authorName);
    formData.append("authorEmail", user?.email || "");

    // 3. Append the binary file if it exists
    if (composer.mediaFile) {
      formData.append("media", composer.mediaFile); 
    }

    // 4. Send without manual 'Content-Type' headers
    const response = await fetchWithTimeout(`${API_BASE}/api/posts`, {
      method: "POST",
      body: formData, 
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to create post.");

    setPosts((current) => [data, ...current]);
    setComposer(emptyComposer);
    setComposerOpen(false);
  } catch (submitError) {
    setError(submitError.message || "Unable to create post.");
  } finally {
    setLoading(false);
  }
};

  const likePost = async (postId) => {
    try {
      const response = await fetchWithTimeout(`${API_BASE}/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to like post.");

      setPosts((current) => current.map((post) => (post.id === postId ? data : post)));
    } catch (likeError) {
      setError(likeError.message || "Unable to like post.");
    }
  };

  const submitComment = async (postId) => {
    const commentText = (commentDrafts[postId] || "").trim();
    if (!commentText) return;

    try {
      const response = await fetchWithTimeout(`${API_BASE}/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: authorName, text: commentText }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to add comment.");

      setPosts((current) => current.map((post) => (post.id === postId ? data : post)));
      setCommentDrafts((current) => ({ ...current, [postId]: "" }));
    } catch (commentError) {
      setError(commentError.message || "Unable to add comment.");
    }
  };

  const deletePost = async (post) => {
    if (!window.confirm("Delete this post?")) return;

    try {
      const response = await fetchWithTimeout(`${API_BASE}/api/posts/${post.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: user?.uid || "" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unable to delete post.");
      }

      setPosts((current) => current.filter((item) => item.id !== post.id));
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete post.");
    }
  };

  const userOwnsPost = (post) => Boolean(user?.uid && post.authorId && user.uid === post.authorId);

  return (
    <div style={{ minHeight: "100vh", padding: "88px 20px 36px", background: "linear-gradient(180deg, #0f172a 0%, #111827 22%, #f8fafc 22%, #f8fafc 100%)" }}>
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        
        {/* Banner Section */}
        <section style={{ color: "#fff", padding: "28px", borderRadius: "28px", background: "radial-gradient(circle at top right, rgba(59, 130, 246, 0.32), transparent 26%), linear-gradient(135deg, #0f172a, #1d4ed8)", boxShadow: "0 24px 60px rgba(15, 23, 42, 0.25)", marginBottom: "22px" }}>
          <p style={{ margin: 0, opacity: 0.78, letterSpacing: "0.08em" }}>COMMUNITY WALL</p>
          <h1 style={{ margin: "8px 0 10px", fontSize: "2.3rem" }}>Share confessions, photos, and video posts</h1>
          <p style={{ margin: 0, maxWidth: "720px", lineHeight: 1.6, opacity: 0.9 }}>Posts are stored in MongoDB. Everyone can browse the feed, interact, and manage their own content seamlessly.</p>
          <div style={{ marginTop: "18px" }}>
            <button onClick={() => setComposerOpen((prev) => !prev)} style={{ background: "#fff", color: "#0f172a", border: "none", padding: "12px 18px", borderRadius: "999px", fontWeight: 800, cursor: "pointer", boxShadow: "0 14px 30px rgba(15, 23, 42, 0.2)" }}>
              {composerOpen ? "Hide Post Form" : "Create Post"}
            </button>
          </div>
        </section>

        {/* Composer Form */}
        {composerOpen && (
          <form onSubmit={submitPost} style={{ background: "rgba(255,255,255,0.94)", borderRadius: "24px", padding: "22px", boxShadow: "0 14px 40px rgba(15, 23, 42, 0.12)", border: "1px solid rgba(148, 163, 184, 0.25)", marginBottom: "22px" }}>
            <div style={{ display: "grid", gap: "14px" }}>
              <input placeholder="Post title" value={composer.title} onChange={(e) => setField("title", e.target.value)} style={inputStyle} />
              <textarea placeholder="Write a confession or story..." rows={5} value={composer.content} onChange={(e) => setField("content", e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
              
              <div style={selectRowStyle}>
                <label style={labelStyle}>Media type</label>
                <select value={composer.mediaType} onChange={(e) => setField("mediaType", e.target.value)} style={selectStyle}>
                  <option value="text">Text confession</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <label style={uploadLabelStyle}>
                Upload image or video
                <input type="file" accept="image/*,video/*" onChange={handleFileChange} style={{ display: "block", marginTop: "10px" }} />
              </label>

              {composer.mediaUrl && (
                <div style={previewBoxStyle}>
                  <strong style={{ display: "block", marginBottom: "10px" }}>Preview</strong>
                  {composer.mediaType === "video" ? (
                    <video src={composer.mediaUrl} controls style={{ width: "100%", borderRadius: "18px", maxHeight: "360px" }} />
                  ) : (
                    <img src={composer.mediaUrl} alt="preview" style={{ width: "100%", borderRadius: "18px", objectFit: "cover" }} />
                  )}
                </div>
              )}

              <button type="submit" disabled={loading} style={{ ...submitButtonStyle, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Publishing..." : "Publish Post"}
              </button>
            </div>
          </form>
        )}

        {/* System Messages */}
        {error && <div style={{ marginBottom: "18px", padding: "14px 16px", borderRadius: "16px", background: "#fee2e2", color: "#991b1b", fontWeight: 700 }}>{error}</div>}

        {/* Dynamic Feed Presentation */}
        {loading && posts.length === 0 ? (
          <div style={feedGridStyle}>
            {[1, 2, 3].map((n) => (
              <div key={n} style={{ ...postCardStyle, opacity: 0.6, animation: "pulse 1.5s infinite ease-in-out" }}>
                <div style={{ height: "20px", width: "40%", background: "#cbd5e1", borderRadius: "4px", marginBottom: "12px" }} />
                <div style={{ height: "32px", width: "80%", background: "#e2e8f0", borderRadius: "6px", marginBottom: "16px" }} />
                <div style={{ height: "14px", background: "#f1f5f9", borderRadius: "4px", marginBottom: "8px" }} />
                <div style={{ height: "14px", background: "#f1f5f9", borderRadius: "4px", width: "90%" }} />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div style={stateCardStyle}>No community posts found. Be the first to start the trend!</div>
        ) : (
          <div style={feedGridStyle}>
            {posts.map((post) => (
              <article key={post.id} style={postCardStyle}>
                <div style={postHeaderStyle}>
                  <div>
                    <p style={metaStyle}>{post.authorName}</p>
                    <h2 style={{ margin: "6px 0 0", color: "#0f172a", fontSize: "1.35rem" }}>{post.title || "Untitled confession"}</h2>
                  </div>
                  {userOwnsPost(post) && (
                    <button onClick={() => deletePost(post)} style={deleteButtonStyle}>Delete</button>
                  )}
                </div>

                {post.content && <p style={contentStyle}>{post.content}</p>}

                {post.mediaUrl && post.mediaType === "image" && (
                  <img src={post.mediaUrl} alt={post.title} style={mediaImageStyle} />
                )}

                {post.mediaUrl && post.mediaType === "video" && (
                  <video src={post.mediaUrl} controls style={mediaVideoStyle} />
                )}

                <div style={actionsRowStyle}>
                  <button type="button" onClick={() => likePost(post.id)} style={actionButtonStyle}>
                    👍 Like · {post.likes}
                  </button>
                  <span style={metaStyle}>{formatDate(post.createdAt)}</span>
                </div>

                <div style={commentBoxStyle}>
                  <div style={commentListStyle}>
                    {post.comments.map((comment) => (
                      <div key={comment.id} style={commentItemStyle}>
                        <strong>{comment.name}:</strong> <span>{comment.text}</span>
                      </div>
                    ))}
                  </div>

                  <div style={commentFormStyle}>
                    <input
                      placeholder="Add a comment"
                      value={commentDrafts[post.id] || ""}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          submitComment(post.id);
                        }
                      }}
                      onChange={(e) => setCommentDrafts((curr) => ({ ...curr, [post.id]: e.target.value }))}
                      style={commentInputStyle}
                    />
                    <button type="button" onClick={() => submitComment(post.id)} style={commentButtonStyle}>Comment</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Styling structures remain identical to your current CSS variables definitions
const inputStyle = { width: "100%", padding: "14px 16px", borderRadius: "16px", border: "1px solid #cbd5e1", outline: "none", fontSize: "1rem", background: "#fff" };
const selectRowStyle = { display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" };
const labelStyle = { fontWeight: 800, color: "#0f172a" };
const selectStyle = { padding: "12px 14px", borderRadius: "14px", border: "1px solid #cbd5e1", background: "#fff" };
const uploadLabelStyle = { display: "block", padding: "16px", borderRadius: "18px", border: "1px dashed #94a3b8", background: "#f8fafc", color: "#334155", fontWeight: 700 };
const previewBoxStyle = { background: "#f8fafc", borderRadius: "20px", padding: "16px", border: "1px solid #e2e8f0" };
const submitButtonStyle = { background: "linear-gradient(135deg, #0f172a, #2563eb)", color: "#fff", border: "none", padding: "14px 18px", borderRadius: "16px", fontWeight: 800, fontSize: "1rem" };
const stateCardStyle = { padding: "28px", textAlign: "center", borderRadius: "24px", background: "rgba(255,255,255,0.92)", boxShadow: "0 14px 40px rgba(15, 23, 42, 0.12)", color: "#334155" };
const feedGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" };
const postCardStyle = { background: "rgba(255,255,255,0.96)", borderRadius: "24px", padding: "20px", boxShadow: "0 16px 42px rgba(15, 23, 42, 0.12)", border: "1px solid rgba(148, 163, 184, 0.2)" };
const postHeaderStyle = { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" };
const deleteButtonStyle = { background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "999px", padding: "10px 14px", cursor: "pointer", fontWeight: 800 };
const metaStyle = { margin: 0, color: "#64748b", fontSize: "0.9rem", fontWeight: 700 };
const contentStyle = { color: "#1e293b", lineHeight: 1.7, margin: "16px 0", whiteSpace: "pre-wrap" };
const mediaImageStyle = { width: "100%", borderRadius: "20px", marginTop: "8px", objectFit: "cover" };
const mediaVideoStyle = { width: "100%", borderRadius: "20px", marginTop: "8px" };
const actionsRowStyle = { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", marginTop: "16px", flexWrap: "wrap" };
const actionButtonStyle = { background: "#0f172a", color: "#fff", border: "none", borderRadius: "999px", padding: "10px 16px", cursor: "pointer", fontWeight: 800 };
const commentBoxStyle = { marginTop: "18px", paddingTop: "16px", borderTop: "1px solid #e2e8f0" };
const commentListStyle = { display: "grid", gap: "8px", marginBottom: "12px" };
const commentItemStyle = { background: "#f8fafc", padding: "10px 12px", borderRadius: "14px", color: "#334155" };
const commentFormStyle = { display: "flex", gap: "10px", flexWrap: "wrap" };
const commentInputStyle = { flex: 1, minWidth: "180px", padding: "12px 14px", borderRadius: "14px", border: "1px solid #cbd5e1" };
const commentButtonStyle = { padding: "12px 16px", borderRadius: "14px", background: "#2563eb", color: "#fff", border: "none", cursor: "pointer", fontWeight: 800 };

export default CommunityBoard;
