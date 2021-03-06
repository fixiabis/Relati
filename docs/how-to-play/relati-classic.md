# relati

- 玩家人數：2 - 4 人
- 棋盤大小：2 人為 5x5，3 人為 7x7，4 人為 9x9，公式為：`(玩家數 * 2 + 1) ^ 2`
- 遊戲目的：不要讓自己無法連線而輸掉

## 遊戲流程

1. 決定玩家優先順序，並依照順序使用以下符號：圈圈、叉叉、三角形、方形
2. 輪到的玩家[放置符號](#放置符號)一次
3. 輪到下一位能[放置符號](#放置符號)的玩家

## 放置符號

在棋盤上選擇格子，放置玩家所使用的符號。

## 遊戲規則

- 玩家在[放置符號](#放置符號)時，應符合[放置條件](#放置條件)
- 僅一位能[放置符號](#放置符號)的玩家，該玩家[放置符號](#放置符號)後，則：
  - 該玩家還能[放置符號](#放置符號)時，為本局贏家，結束遊戲
  - 無玩家能[放置符號](#放置符號)時，本局沒有贏家，結束遊戲

### 放置條件

選擇格子放置符號時，應符合以下要求：

- 該格子為空格
- 該符號已在棋盤上存在相同符號時，該格子應符合[連線條件](#連線條件)

### 連線條件

以下為棋盤一角，使用[方向代號](#方向代號)進行說明：

```
| FL |  F | FR |
|  L |  C |  R |
| BL |  B | BR |
```

棋盤一角存在八種方向的格子：`F`、`B`、`L`、`R`、`FR`、`FL`、`BR`、`BL`

在任一格子上存在相同符號時，`C` 格便可與之連線。  
如 `F` 格上存在相同符號時，`C` 格便可與之連線。  
同理，`BR` 格上存在相同符號時，對 `C` 來說連線也成立，以此類推。

## 術語與名詞解釋

### 方向代號

- `F` 為前方 (Front)
- `B` 為後方 (Back)
- `L` 為左方 (Left)
- `R` 為右方 (Right)
- `C` 為目前位置 (Current)，亦可看作中央 (Center)
