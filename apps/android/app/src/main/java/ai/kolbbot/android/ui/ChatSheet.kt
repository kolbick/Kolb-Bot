package ai.kolb-bot.android.ui

import androidx.compose.runtime.Composable
import ai.kolb-bot.android.MainViewModel
import ai.kolb-bot.android.ui.chat.ChatSheetContent

@Composable
fun ChatSheet(viewModel: MainViewModel) {
  ChatSheetContent(viewModel = viewModel)
}
