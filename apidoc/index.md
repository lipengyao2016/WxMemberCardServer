
## 概述  
***  
**插件式框架支撑平台**(Plugin Frame Support Platform， 以下简称 `PFSP` ),为 `React` 前端插件式框架提供平台级数据支撑。
包括：应用系统、鉴权、插件、菜单、用户、角色、权限等后台业务服务。
不同的上层应用系统表现形式虽然不同，但后台的业务逻辑及数据模型基本相同。
所以抽象一层平台级服务，为上层提供插件管理及系统常用业务服务。
使得研发能快速应对新的应用市场的变化，降低开发和运营成本，并与最佳的方式减少应用系统开发的难度。

PFSP 对外以轻量级的 REST API 的方式提供给前端应用系统使用，这是一种可交互的、简单方便调用的、接口统一的接口形式。

更多关于[REST API](rest.md)接口详细描述请参见后续章节。   

***
## 概念
***
PFSP 选用ROA架构，以`资源`的方式操作和协同完成各样业务，以下简要的介绍一下各种资源概念。

 - **Application** -- 应用系统  
    Application资源是一个抽象概念，本不是指真实的应用系统程序，在`PFSP`中，它仅只是用来简要描述一个外部真实存在应用系统，以表示其存在。
    同时作为该外部真实系统调用`PFSP`接口的一个重要入口。你可以通过Application资源操作其它资源，如Account、User、Role、Menu。  
    
 - **Account** -- 账户  
    Account资源用于保存个人的账户信息，如name、mobile、email、password等，为Application用户提供登陆鉴权服务。
    在`PFSP`平台内个人账户Account是唯一的，故name、mobile、password都是唯一关键字。
    
 - **User** --用户  
    User资源保持个人在每个Application里的相关信息。
    User在具体的一个Applicaiton下是唯一的，但在`PFSP`平台内却不是唯一的。它是Application的独有的资源。
    
 - **Role** -- 角色  
    Role资源用于描述各应用系统内的角色信息，它可以将不同类型的用户进行分组，进行分类管理。
    通常Role资源向下关联应用系统中的Menu及Operator。
    
 - **Menu** -- 菜单  
    Meun资源用于描述应用程序页面菜单信息，它可以分多级菜单，最底层菜单通常都会与某一插件相关联。
    它是Application独有资源，在同一个Application内它是唯一的。
    
 - **Plugin** —— 插件  
    Plugin资源用来描述前端插件的相关信息的资源，除了可以通过Plugin获取插件信息外，它下面还包括了Widget、Operator。
    它是一种全局共享资源，与Application同级，可以直接操作和获取所有插件的信息。
    
 - **Widget** -- 部件  
    Widget资源用于描述Plugin前端显示页面信息，如：类型、图片、大小等。
    
 - **Operator** --操作权限  
    Operator资源用于描述一个Widget部件页面的操作权限。