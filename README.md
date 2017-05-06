# 2017前端星计划作业--手势密码

[在线demo](https://ucev.github.io/gesture/index.html)

因为本题涉及手势操作及其判断，交互很复杂。所以我就先画了个流程图，理清思路  
![流程图](http://www.ilovecrystal.com.cn/myres/gesture.png)

看了这么多状态变换及判断之后，我就决定用 *react* 来对界面进行构建。我先把页面分成如下结构  
![网页结构](http://www.ilovecrystal.com.cn/myres/gesture_components.png)

其中 GestureCanvas 负责手机侦测即绘图， GestureTitle 负责显示提示消息， GestureOpeBar 负责设置当前的操作是 `设置密码` 还是 `验证密码`。这三者的状态交互统一归 `GesturePassword` 管理。

确定了页面结构和交互流程之后，就可以开始编码了。  