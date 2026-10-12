package com.stellar.outdoor.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.stellar.outdoor.data.FeedComment
import com.stellar.outdoor.data.FeedPost
import com.stellar.outdoor.data.GroupCircle
import com.stellar.outdoor.data.StoryCard

/**
 * Stellar 发现首页（包含热门卡片、小组圆头像、带时间轴评论的动态信息流）
 * Meta/Facebook 极简社交卡片风格
 */
@Composable
fun DiscoverScreen(
    stories: List<StoryCard> = SAMPLE_STORIES,
    circles: List<GroupCircle> = SAMPLE_CIRCLES,
    feedPosts: List<FeedPost> = SAMPLE_FEED_POSTS,
    onStoryClick: (StoryCard) -> Unit = {},
    onCircleClick: (GroupCircle) -> Unit = {},
    onPostLike: (String) -> Unit = {},
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF2F2F7))
    ) {
        // 顶栏 Header
        Surface(
            modifier = Modifier.fillMaxWidth(),
            color = Color.White,
            shadowElevation = 1.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp)
            ) {
                Text(
                    text = "发现广场",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF050505)
                )
                Text(
                    text = "热门切片 · 小组社群 · 实时评论时间轴",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF65676B)
                )
            }
        }

        // LazyColumn 滚动列表（规范：绝对禁止在 LazyColumn 的内部 items 中嵌套 LazyColumn）
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 16.dp)
        ) {
            // 1. 热门卡片 Section (LazyRow)
            item {
                StoriesSection(stories = stories, onStoryClick = onStoryClick)
            }

            // 2. 小组圆头像 Section (LazyRow)
            item {
                GroupCirclesSection(circles = circles, onCircleClick = onCircleClick)
            }

            // 3. 动态信息流与评论时间轴 Section
            items(feedPosts) { post ->
                DiscoverFeedPostCard(
                    post = post,
                    onLikeClick = { onPostLike(post.id) },
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
        }
    }
}

@Composable
fun StoriesSection(
    stories: List<StoryCard>,
    onStoryClick: (StoryCard) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        shape = RoundedCornerShape(0.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(modifier = Modifier.padding(vertical = 12.dp)) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "🔥 热门切片",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = Color(0xFF050505)
                )
                Text(
                    text = "滑动查看更多 >",
                    fontSize = 11.sp,
                    color = Color(0xFF1877F2),
                    fontWeight = FontWeight.SemiBold
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            LazyRow(
                contentPadding = PaddingValues(horizontal = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(stories) { story ->
                    StoryItemCard(story = story, onClick = { onStoryClick(story) })
                }
            }
        }
    }
}

@Composable
fun StoryItemCard(
    story: StoryCard,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .width(110.dp)
            .height(150.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(Color.Black)
            .clickable { onClick() }
    ) {
        AsyncImage(
            model = story.coverUrl,
            contentDescription = story.title,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize(),
            alpha = 0.85f
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Surface(
                shape = RoundedCornerShape(6.dp),
                color = Color(0xFF1877F2)
            ) {
                Text(
                    text = story.type,
                    color = Color.White,
                    fontSize = 8.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                )
            }

            Text(
                text = story.title,
                color = Color.White,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
fun GroupCirclesSection(
    circles: List<GroupCircle>,
    onCircleClick: (GroupCircle) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        shape = RoundedCornerShape(0.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(modifier = Modifier.padding(vertical = 12.dp)) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "👥 小组活跃社群",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = Color(0xFF050505)
                )
                Text(
                    text = "点击切换小组",
                    fontSize = 11.sp,
                    color = Color(0xFF65676B)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            LazyRow(
                contentPadding = PaddingValues(horizontal = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(circles) { circle ->
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.clickable { onCircleClick(circle) }
                    ) {
                        Box {
                            AsyncImage(
                                model = circle.avatarUrl,
                                contentDescription = circle.name,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier
                                    .size(52.dp)
                                    .clip(CircleShape)
                                    .border(
                                        2.dp,
                                        if (circle.hasNewActivity) Color(0xFF1877F2) else Color.LightGray,
                                        CircleShape
                                    )
                            )
                            if (circle.isFamily) {
                                Surface(
                                    modifier = Modifier.align(Alignment.TopEnd),
                                    shape = RoundedCornerShape(6.dp),
                                    color = Color(0xFFFFB800)
                                ) {
                                    Text(
                                        text = "核心",
                                        color = Color.White,
                                        fontSize = 8.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = circle.name,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF050505),
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun DiscoverFeedPostCard(
    post: FeedPost,
    onLikeClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .shadow(2.dp, shape = RoundedCornerShape(16.dp)),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    AsyncImage(
                        model = post.userAvatar,
                        contentDescription = post.userName,
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = post.userName,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = Color(0xFF050505)
                        )
                        Text(
                            text = post.date,
                            fontSize = 10.sp,
                            color = Color(0xFF65676B)
                        )
                    }
                }

                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFFE7F3FF),
                    modifier = Modifier.clickable { }
                ) {
                    Text(
                        text = "+ 关注",
                        color = Color(0xFF1877F2),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Post Content Text
            Text(
                text = post.content,
                fontSize = 12.sp,
                color = Color(0xFF050505),
                lineHeight = 18.sp
            )

            // Media
            post.mediaUrl?.let { url ->
                Spacer(modifier = Modifier.height(10.dp))
                AsyncImage(
                    model = url,
                    contentDescription = "Media",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                        .clip(RoundedCornerShape(12.dp))
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Action Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                TextButton(onClick = onLikeClick) {
                    Icon(imageVector = Icons.Default.FavoriteBorder, contentDescription = "Like", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("${post.likes} 赞", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
                TextButton(onClick = { }) {
                    Icon(imageVector = Icons.Default.Comment, contentDescription = "Comment", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("${post.comments.size} 评论", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
                TextButton(onClick = { }) {
                    Icon(imageVector = Icons.Default.Share, contentDescription = "Share", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("分享", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }

            // 时间轴评论区 (Timeline Comments Section)
            if (post.comments.isNotEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFFF0F2F5),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Text(
                            text = "💬 评论时间轴 (${post.comments.size})",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF65676B)
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        post.comments.forEach { comment ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 3.dp),
                                verticalAlignment = Alignment.Top
                            ) {
                                AsyncImage(
                                    model = comment.userAvatar,
                                    contentDescription = comment.userName,
                                    modifier = Modifier
                                        .size(20.dp)
                                        .clip(CircleShape)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Column(
                                    modifier = Modifier
                                        .weight(1f)
                                        .background(Color.White, shape = RoundedCornerShape(8.dp))
                                        .padding(6.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(text = comment.userName, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF050505))
                                        Text(text = comment.timestamp, fontSize = 8.sp, color = Color.Gray)
                                    }
                                    Text(text = comment.content, fontSize = 10.sp, color = Color(0xFF050505), modifier = Modifier.padding(top = 2.dp))
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// Sample Mock Data
val SAMPLE_STORIES = listOf(
    StoryCard("s1", "热门切片", "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=400", "雁栖湖45km骑行路书"),
    StoryCard("s2", "户外速报", "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=400", "星空露营与极光摄影"),
    StoryCard("s3", "架构研讨", "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400", "分布式系统演进切片")
)

val SAMPLE_CIRCLES = listOf(
    GroupCircle("c1", true, "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150", "徒步核心组", true),
    GroupCircle("c2", false, "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150", "UI设计公会", true),
    GroupCircle("c3", true, "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150", "极客车队", false)
)

val SAMPLE_FEED_POSTS = listOf(
    FeedPost(
        id = "f1",
        userAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
        userName = "Hui Zhang",
        date = "10分钟前",
        content = "今天跟极客车队的小伙伴一起完成了 45km 的雁栖湖拉练！今天天气极佳，平均速度保持在 24.5km/h，大家协作配合太默契了！👍",
        mediaUrl = "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800",
        likes = 38,
        comments = listOf(
            FeedComment("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150", "Alex Mercer", "下周末安排百里画廊路线，有人一起报名吗？", "8分钟前"),
            FeedComment("https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150", "Sarah Chen", "拍的照片真棒！路书轨迹文件能分享一下吗？", "5分钟前")
        )
    )
)

@Preview
@Composable
fun DiscoverScreenPreview() {
    DiscoverScreen()
}
