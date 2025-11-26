import React, { useState, useEffect, useRef } from 'react'
import './SocialMedia.css'
const SocialMedia = () => {
  // State management
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [friends] = useState([
    { name: 'Lê Văn An', avatar: '/src/img/avatar-1.png' },
    { name: 'Nguyễn Thị Bình', avatar: '/src/img/avatar-1.png' },
    { name: 'Trần Quốc Cường', avatar: '/src/img/avatar-1.png' },
    { name: 'Phạm Duy', avatar: '/src/img/avatar-1.png' },
    { name: 'Hà Minh Thư', avatar: '/src/img/avatar-1.png' }
  ])

  const [newPostText, setNewPostText] = useState('')
  const [pendingImages, setPendingImages] = useState([])
  const [commentInputs, setCommentInputs] = useState({})
  const [visibleComments, setVisibleComments] = useState({})
  const [hoverTimeouts, setHoverTimeouts] = useState({})
  const [loadedComments, setLoadedComments] = useState({}) // Store loaded comments for each post
  const [userId, setUserId] = useState(3) // Default user ID for testing

  const fileInputRef = useRef(null)

  // Fetch posts from backend
  const fetchPosts = async () => {
    try {
      setLoading(true)
      const postsData = await getAllPosts()

      // Transform backend data to frontend format
      const transformedPosts = postsData.map((post) => ({
        id: post.Id,
        username: post.AuthorName,
        avatar: '/src/img/avatar-1.png', // Default avatar
        image: post.Image,
        text: post.Content,
        title: post.Title,
        reaction: null, // TODO: Implement user reactions
        comments: [], // TODO: Fetch actual comments
        createdAt: post.CreatedAt,
        commentsCount: post.CommentsCount,
        reactionsCount: post.ReactionsCount
      }))

      setPosts(transformedPosts)
      setError(null)
    } catch (err) {
      setError('Failed to load posts')
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create new post
  const createPost = async (postData) => {
    try {
      await apiCreatePost({
        title: postData.title || 'New Post',
        text: postData.text,
        authorId: userId,
        image: postData.image
      })

      // Refresh posts after creating new one
      await fetchPosts()
      return true
    } catch (err) {
      console.error('Error creating post:', err)
      return false
    }
  }

  // Create comment
  const createComment = async (postId, commentText) => {
    try {
      await apiCreateComment({
        postId: postId,
        authorId: userId,
        content: commentText
      })

      // Refresh posts to show new comment
      await fetchPosts()
      return true
    } catch (err) {
      console.error('Error creating comment:', err)
      return false
    }
  }

  // Create reaction
  const createReaction = async (targetType, targetId, reactionType) => {
    try {
      await apiCreateReaction({
        userId: userId,
        targetType: targetType,
        targetId: targetId,
        reactionType: reactionType
      })

      // Refresh posts to show updated reaction count
      await fetchPosts()
      return true
    } catch (err) {
      console.error('Error creating reaction:', err)
      return false
    }
  }

  // Load posts on component mount
  useEffect(() => {
    fetchPosts()
  }, [])

  // Utility functions
  const escapeHtml = (text) => {
    return text
  }

  const getReactionIcon = (reaction) => {
    const icons = {
      like: '👍',
      dislike: '👎',
      love: '❤️',
      haha: '😂',
      wow: '😮'
    }
    return reaction ? icons[reaction] : '👍'
  }

  const getReactionText = (reaction) => {
    const texts = {
      like: 'Thích',
      dislike: 'Không thích',
      love: 'Thương',
      haha: 'Haha',
      wow: 'Wow'
    }
    return reaction ? texts[reaction] : 'Thích'
  }

  // Event handlers
  const handleReaction = async (postId, reactionType) => {
    // Update local state optimistically
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, reaction: post.reaction === reactionType ? null : reactionType }
          : post
      )
    )

    // Send to backend
    const success = await createReaction('POST', postId, reactionType)
    if (!success) {
      // Revert on failure
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, reaction: post.reaction === reactionType ? reactionType : null }
            : post
        )
      )
    }
  }

  const showReactionMenu = (postId) => {
    const timeoutId = setTimeout(() => {
      const menu = document.getElementById(`reaction-menu-${postId}`)
      if (menu) {
        menu.classList.add('visible')
      }
    }, 500)

    setHoverTimeouts((prev) => ({ ...prev, [postId]: timeoutId }))
  }

  const hideReactionMenu = (postId) => {
    const timeoutId = hoverTimeouts[postId]
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    const menu = document.getElementById(`reaction-menu-${postId}`)
    if (menu) {
      menu.classList.remove('visible')
    }
  }

  const toggleCommentBox = async (postId) => {
    const isVisible = visibleComments[postId]

    // If comments are not visible and not loaded yet, fetch them
    if (!isVisible && !loadedComments[postId]) {
      try {
        const comments = await getAllPosts() // This will get all posts with comments
        const postComments = comments
          .filter((post) => post.Id === postId)
          .flatMap((post) => post.Comments || [])
          .map((comment) => ({
            id: comment.Id,
            authorName: comment.AuthorName,
            content: comment.Content,
            createdAt: comment.CreatedAt
          }))

        setLoadedComments((prev) => ({
          ...prev,
          [postId]: postComments
        }))
      } catch (error) {
        console.error('Error fetching comments:', error)
      }
    }

    setVisibleComments((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }))
  }

  const handleCommentInputChange = (postId, value) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value
    }))
  }

  const addComment = async (postId) => {
    const commentText = commentInputs[postId]?.trim()
    if (commentText) {
      const success = await createComment(postId, commentText)
      if (success) {
        setCommentInputs((prev) => ({ ...prev, [postId]: '' }))
      }
    }
  }

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files)
    const newImages = []

    files.forEach((file) => {
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          newImages.push(e.target.result)
          if (newImages.length === files.length) {
            setPendingImages(newImages)
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeImage = (index) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index))
    // Update file input
    const dt = new DataTransfer()
    const files = Array.from(fileInputRef.current.files)
    files.splice(index, 1)
    files.forEach((file) => dt.items.add(file))
    fileInputRef.current.files = dt.files
  }

  const handlePostSubmit = async () => {
    const text = newPostText.trim()
    if (!text && pendingImages.length === 0) {
      alert('Vui lòng nhập nội dung hoặc chọn ảnh!')
      return
    }

    const success = await createPost({
      text: text,
      image: pendingImages.length > 0 ? pendingImages[0] : null
    })

    if (success) {
      setNewPostText('')
      setPendingImages([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="feed-wrapper">
      {/* Left Sidebar */}
      <div className="left-sidebar">
        <img src="/src/img/avatar-1.png" alt="Ảnh đại diện" className="sidebar-avatar" />
        <a href="#profile" className="sidebar-link">
          🧑 Trang cá nhân
        </a>
        <a href="#friends" className="sidebar-link">
          👥 Danh sách bạn bè
        </a>
      </div>

      {/* Right Sidebar */}
      <div className="right-sidebar">
        <h3>👥 Bạn bè</h3>
        <div id="friend-list">
          {friends.map((friend, index) => (
            <div key={index} className="friend-item">
              <img src={friend.avatar} alt="avatar" className="friend-avatar" />
              <span className="friend-name">{friend.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Feed Section */}
      <div className="main-feed-section">
        {/* Post Composer */}
        <div className="userpost-card">
          <div className="composer-row">
            <img src="/src/img/avatar-1.png" alt="Ảnh đại diện" className="user-avatar" />
            <textarea
              className="composer-input"
              maxLength="256"
              placeholder="Bạn đang nghĩ gì? (Tối đa 256 ký tự)"
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
            />
          </div>
          <div className="composer-actions">
            <label htmlFor="composer-photo" className="photo-label">
              🖼️ Ảnh
            </label>
            <input
              type="file"
              accept="image/*"
              id="composer-photo"
              className="composer-photo-input"
              multiple
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <div id="image-preview-container">
              {pendingImages.map((imageData, index) => (
                <div key={index} className="image-preview-item">
                  <img src={imageData} className="image-preview" alt={`Preview ${index + 1}`} />
                  <button
                    className="image-remove-btn"
                    onClick={() => removeImage(index)}
                    title="Xóa ảnh"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button className="post-btn" onClick={handlePostSubmit}>
              Đăng bài
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner">Đang tải...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchPosts}>Thử lại</button>
          </div>
        )}

        {/* Feed Container */}
        <div id="feed-list">
          {!loading &&
            !error &&
            posts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-top">
                  <img src={post.avatar} alt="avatar" className="post-avatar" />
                  <span className="post-username">{post.username}</span>
                </div>
                <div className="post-content">
                  {post.text && (
                    <div style={{ margin: '0.6rem 0 0.3rem 0.1rem' }}>{escapeHtml(post.text)}</div>
                  )}
                </div>
                {post.images ? (
                  <div className="post-images">
                    {post.images.map((img, idx) => (
                      <img key={idx} src={img} className="post-image" alt={`Bài đăng ${idx + 1}`} />
                    ))}
                  </div>
                ) : post.image ? (
                  <img src={post.image} className="post-image" alt="Bài đăng" />
                ) : null}
                <div className="post-actions">
                  <div
                    className="reaction-container"
                    onMouseEnter={() => showReactionMenu(post.id)}
                    onMouseLeave={() => hideReactionMenu(post.id)}
                  >
                    <button
                      className={`action-btn${post.reaction ? ' reacted' : ''}`}
                      onClick={() => handleReaction(post.id, 'like')}
                    >
                      <span className="reaction-icon">{getReactionIcon(post.reaction)}</span>{' '}
                      {getReactionText(post.reaction)}
                    </button>
                    <div className="reaction-menu" id={`reaction-menu-${post.id}`}>
                      <button
                        className="reaction-option"
                        onClick={() => handleReaction(post.id, 'like')}
                        title="Thích"
                      >
                        👍
                      </button>
                      <button
                        className="reaction-option"
                        onClick={() => handleReaction(post.id, 'dislike')}
                        title="Không thích"
                      >
                        👎
                      </button>
                      <button
                        className="reaction-option"
                        onClick={() => handleReaction(post.id, 'love')}
                        title="Thương thương"
                      >
                        ❤️
                      </button>
                      <button
                        className="reaction-option"
                        onClick={() => handleReaction(post.id, 'haha')}
                        title="Haha"
                      >
                        😂
                      </button>
                      <button
                        className="reaction-option"
                        onClick={() => handleReaction(post.id, 'wow')}
                        title="Wow"
                      >
                        😮
                      </button>
                    </div>
                  </div>
                  <button className="action-btn" onClick={() => toggleCommentBox(post.id)}>
                    💬 Bình luận ({post.commentsCount || 0})
                  </button>
                  <button className="action-btn">👍 {post.reactionsCount || 0}</button>
                  <button
                    className="action-btn"
                    onClick={() => alert('Tính năng chia sẻ chưa có!')}
                  >
                    ↗️ Chia sẻ
                  </button>
                </div>
                <div
                  className="comment-section"
                  style={{ display: visibleComments[post.id] ? 'block' : 'none' }}
                >
                  <div className="comment-list">
                    {(loadedComments[post.id] || []).map((comment, idx) => (
                      <div key={comment.id || idx} className="comment">
                        <strong>{comment.authorName}:</strong> {escapeHtml(comment.content)}
                      </div>
                    ))}
                  </div>
                  <div className="comment-input-wrap">
                    <input
                      type="text"
                      className="comment-input"
                      maxLength="128"
                      placeholder="Viết bình luận..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => handleCommentInputChange(post.id, e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addComment(post.id)}
                    />
                    <button className="comment-submit-btn" onClick={() => addComment(post.id)}>
                      Gửi
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default SocialMedia
