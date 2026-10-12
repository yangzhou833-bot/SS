package com.stellar.outdoor.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import com.stellar.outdoor.data.FeedPost
import com.stellar.outdoor.data.GroupTab
import com.stellar.outdoor.data.GroupHomeUiState

/**
 * Stellar 小组内容主页（带有活动、文件、Feed流的控制台）
 * Meta/Facebook 极简社交卡片风格
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GroupHomeScreen(
    uiState: GroupHomeUiState = GroupHomeUiState(
        groupName = "雁栖湖极客车队",
        subTitle = "专注公路骑行、越野拉练与分布式技术协作",
        isPublic = true,
        memberCount = 16
    ),
    feedPosts: List<FeedPost> = emptyList(),
    onBackClick: () -> Unit = {},
    onTabSelected: (GroupTab) -> Unit = {},
    modifier: Modifier = Modifier
) {
    var selectedTabState by remember { mutableStateOf(uiState.selectedTab) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF2F2F7))
    ) {
        // 1. 顶部横幅区 (TopBannerSection)
        TopBannerSection(
            groupName = uiState.groupName,
            onBackClick = onBackClick,
            onSettingClick = {}
        )

        // 2. 动态滑动主区域 (LazyColumn)
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 16.dp)
        ) {
            // 小组基本信息栏
            item {
                GroupInfoRow(
                    subTitle = uiState.subTitle,
                    isPublic = uiState.isPublic,
                    memberCount = uiState.memberCount
                )
            }

            // 输入与互动栏
            item {
                ComposerSection(
                    onPostClick = {},
                    onImageClick = {}
                )
            }

            // 功能导航栏
            item {
                CustomTabRow(
                    selectedTab = selectedTabState,
                    onTabSelected = {
                        selectedTabState = it
                        onTabSelected(it)
                    }
                )
            }

            // 动态信息流 (根据选择的 Tab 渲染不同 Feed)
            items(feedPosts) { post ->
                PostCard(
                    post = post,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
        }
    }
}

@Composable
fun TopBannerSection(
    groupName: String,
    onBackClick: () -> Unit,
    onSettingClick: () -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Color.White,
        shadowElevation = 1.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(
                    onClick = onBackClick,
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "返回",
                        tint = Color(0xFF050505)
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = groupName,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF050505)
                )
            }

            IconButton(
                onClick = onSettingClick,
                modifier = Modifier.size(40.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.MoreVert,
                    contentDescription = "设置",
                    tint = Color(0xFF65676B)
                )
            }
        }
    }
}

@Composable
fun GroupInfoRow(
    subTitle: String,
    isPublic: Boolean,
    memberCount: Int
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = subTitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFF65676B),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = Color(0xFFE4E6EB)
                    ) {
                        Text(
                            text = if (isPublic) "公开" else "非公开",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF050505),
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = "人",
                            tint = Color(0xFF1877F2),
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(2.dp))
                        Text(
                            text = "${memberCount}人",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF050505)
                        )
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Text(
                        text = "→ 邀请",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1877F2),
                        modifier = Modifier.clickable { }
                    )
                }
            }

            Spacer(modifier = Modifier.width(8.dp))

            Box(
                modifier = Modifier
                    .size(52.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF1877F2)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "+$memberCount",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }
        }
    }
}

@Composable
fun ComposerSection(
    onPostClick: () -> Unit,
    onImageClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 4.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = Color(0xFFF0F2F5),
                modifier = Modifier.clickable { }
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "类型 ▾", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF050505))
                }
            }

            Spacer(modifier = Modifier.width(8.dp))

            Surface(
                shape = RoundedCornerShape(12.dp),
                color = Color(0xFFF0F2F5),
                modifier = Modifier
                    .weight(1f)
                    .clickable { onPostClick() }
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.AddCircle,
                        contentDescription = "Add",
                        tint = Color(0xFF1877F2),
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "⊕ 写点什么...",
                        fontSize = 12.sp,
                        color = Color(0xFF65676B)
                    )
                }
            }

            Spacer(modifier = Modifier.width(8.dp))

            IconButton(onClick = onImageClick) {
                Icon(
                    imageVector = Icons.Default.Image,
                    contentDescription = "上传图片",
                    tint = Color(0xFF10B981)
                )
            }
        }
    }
}

@Composable
fun CustomTabRow(
    selectedTab: GroupTab,
    onTabSelected: (GroupTab) -> Unit
) {
    ScrollableTabRow(
        selectedTabIndex = selectedTab.ordinal,
        edgePadding = 8.dp,
        containerColor = Color.White,
        contentColor = Color(0xFF1877F2)
    ) {
        GroupTab.values().forEach { tab ->
            Tab(
                selected = selectedTab == tab,
                onClick = { onTabSelected(tab) },
                text = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "[${tab.name}]",
                            fontWeight = if (selectedTab == tab) FontWeight.Bold else FontWeight.Normal,
                            color = if (selectedTab == tab) Color(0xFF1877F2) else Color(0xFF65676B)
                        )
                        if (tab == GroupTab.活动) {
                            Spacer(modifier = Modifier.width(4.dp))
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .clip(CircleShape)
                                    .background(Color.Red)
                            )
                        }
                    }
                }
            )
        }
    }
}

@Composable
fun PostCard(
    post: FeedPost,
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
            // Post Author Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
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

                IconButton(onClick = { }) {
                    Icon(imageVector = Icons.Default.MoreVert, contentDescription = "More", tint = Color.Gray)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Post Text
            Text(
                text = post.content,
                fontSize = 12.sp,
                color = Color(0xFF050505),
                lineHeight = 18.sp
            )

            // Post Media Image
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
            Divider(color = Color(0xFFF0F2F5))
            Spacer(modifier = Modifier.height(8.dp))

            // Action Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                TextButton(onClick = { }) {
                    Icon(imageVector = Icons.Default.Navigation, contentDescription = "Nav", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("同步路线", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
                TextButton(onClick = { }) {
                    Icon(imageVector = Icons.Default.Share, contentDescription = "Collab", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("去协作", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
                TextButton(onClick = { }) {
                    Icon(imageVector = Icons.Default.FavoriteBorder, contentDescription = "Like", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("${post.likes} 赞", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Preview
@Composable
fun GroupHomeScreenPreview() {
    GroupHomeScreen()
}
