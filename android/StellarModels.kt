package com.stellar.outdoor.data

/**
 * Stellar Android Core Data Models
 */

// 1. 小组列表数据
data class GroupCardData(
    val id: String,
    val coverUrl: String,
    val title: String,
    val tag: String,
    val isLeader: Boolean,
    val leaderName: String,
    val format: String,
    val city: String,
    val members: List<String>,
    val memberCount: Int
)

// 2. 小组主页状态
data class GroupHomeUiState(
    val groupName: String,
    val subTitle: String,
    val isPublic: Boolean,
    val memberCount: Int,
    val selectedTab: GroupTab = GroupTab.GROUP
)

enum class GroupTab { 小组, 简介, 活动, 照片, 文件 }

// 3. 发现页数据
data class StoryCard(
    val id: String,
    val type: String,
    val coverUrl: String,
    val title: String = ""
)

data class GroupCircle(
    val id: String,
    val isFamily: Boolean,
    val avatarUrl: String,
    val name: String,
    val hasNewActivity: Boolean = false
)

data class FeedComment(
    val userAvatar: String,
    val userName: String,
    val content: String,
    val timestamp: String
)

data class FeedPost(
    val id: String,
    val userAvatar: String,
    val userName: String,
    val date: String,
    val content: String,
    val mediaUrl: String? = null,
    val likes: Int,
    val comments: List<FeedComment>
)
