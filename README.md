# 2017前端星计划作业--手势密码

因为本题涉及手势操作及其判断，交互很复杂。所以我就先画了个流程图，理清思路  
![流程图](http://www.ilovecrystal.com.cn/myres/gesture.png)

看了这么多状态变换及判断之后，我就决定用 *react* 来对界面进行构建。我先把页面分成如下结构  
![网页结构](http://www.ilovecrystal.com.cn/myres/gesture_components.png)

其中 GestureCanvas 负责手机侦测即绘图， GestureTitle 负责显示提示消息， GestureOpeBar 负责设置当前的操作是 `设置密码` 还是 `验证密码`。这三者的状态交互统一归 `GesturePassword` 管理。

确定了页面结构和交互流程之后，就可以开始编码了。  

本项目已经放到了我的 [GitHub](https://github.com/ucev/GesturePassword) 上, 扫描下面的二维码即可在手机上查看这个页面  
![gesture_password](http://www.ilovecrystal.com.cn/myres/gesture_qrcode.png)