const initialHost = 'i.peacht.art' // 처음 불러올 때 호스트
const githubUserName = 'jyhyun1008' // 깃허브 아이디
const githubRepoName = 'Milog' // 깃허브 레포지토리 이름
const domainName = 'https://milog.yna.bz'

const sessionId = localStorage.getItem("sessionId");
const signedHost = localStorage.getItem("signinHost");
const token = localStorage.getItem("token");
const signedusername = localStorage.getItem("username");

var isLogin = false;
if (sessionId && signedHost) {
    isLogin = true;
    document.getElementsByClassName('nav-item')[0].innerHTML += '<a href="./?p=editor"><div class="button" id="editorbt">글쓰기</div></a><a href="./?p=signout"><div class="button" id="loginout">로그아웃</div></a>'
} else {
    document.getElementsByClassName('nav-item')[0].innerHTML += '<a href="./?p=signin"><div class="button" id="loginout">로그인</div></a>'
}

function parseMd(md){ // 깃허브 등에 사용하는 마크다운 파일을 html로 변환시켜 줍니다.
    // 정규식으로 되어 있습니다. 자세한 것은 정규식을 공부해 주세요.

    md = "\n"+md
    const md0 = md.replace(/\</gm,"&lt;").replace(/\>/gm, "&gt;");
  
    //ul
    md = md.replace(/^\s*\n\*\s/gm, '<ul">\n* ');
    md = md.replace(/^(\*\s.+)\s*\n([^\*])/gm, '$1\n</ul>\n\n$2');
    md = md.replace(/^\*\s(.+)/gm, '<li class="list before">$1</li>');
    
    //ul
    md = md.replace(/^\s*\n\-\s/gm, '<ul>\n* ');
    md = md.replace(/^(\-\s.+)\s*\n([^\-])/gm, '$1\n</ul>\n\n$2');
    md = md.replace(/^\-\s(.+)/gm, '<li class="list before">$1</li>');
    
    //ol
    md = md.replace(/^\s*\n\d\.\s/gm, '<ol>\n1. ');
    md = md.replace(/^(\d\.\s.+)\s*\n([^\d\.])/gm, '$1\n</ol>\n\n$2');
    md = md.replace(/^\d\.\s(.+)/gm, '<li>$1</li>');
    
    //blockquote
    md = md.replace(/^\>(.+)/gm, '<blockquote>$1</blockquote>');
    md = md.replace('</blockquote><blockquote>', '');
    md = md.replace('</blockquote>\n<blockquote>', '\n');

    //hr
    md = md.replace(/[\-]{3}/g, '</div></div><div class="item_wrap"><div class="line">✿</div><div class="item">');
    
    //h
    md = md.replace(/\n[\#]{6}(.+)/g, '<h6>$1</h6>');
    md = md.replace(/\n[\#]{5}(.+)/g, '<h5>$1</h5>');
    md = md.replace(/\n[\#]{4}(.+)/g, '<h4>$1</h4>');
    md = md.replace(/\n[\#]{3}(.+)/g, '<h3>$1</h3>');
    md = md.replace(/\n[\#]{2}(.+)/g, '<h2>$1</h2>');
    md = md.replace(/\n[\#]{1}(.+)/g, '</div><div class="item"><h1>$1</h1>');
    
    //images with links
    md = md.replace(/\!\[([^\]]+)\]\(([^\)]+)\)[\(]{1}([^\)\"]+)(\"(.+)\")?[\)]{1}/g, '<div class="gallery"><a href="$3"><img class="postimage" src="$2" alt="$1" width="100%" /></a></div>');
    
    //images
    md = md.replace(/\!\[([^\]]+)\]\(([^\)]+)\)/g, '<img class="postimage" src="$2" alt="$1" width="100%" />');
    
    //links
    md = md.replace(/[\[]{1}([^\]]+)[\]]{1}[\(]{1}([^\)\"]+)(\"(.+)\")?[\)]{1}/g, '<a href="$2" title="$4">$1</a>');
    
    //font styles
    md = md.replace(/[\*]{2}([^\*]+)[\*]{2}/g, '<strong>$1</strong>');
    md = md.replace(/[\*]{1}([^\*]+)[\*]{1}/g, '<i>$1</i>');
    md = md.replace(/[\~]{2}([^\~]+)[\~]{2}/g, '<del>$1</del>');


    //주석
    md = md.replace(/\n[\/]{2}(.+)/g, '');
    

    //code
    md = md.replace(/[\`]{1}([^\`\n]+)[\`]{1}/g, '<code>$1</code>');

    //pre
    
    var mdpos = [];
    var rawpos = [];
    let pos1 = -1;
    let k = 0;

    var diff = [0]

    while( (pos1 = md0.indexOf('\n```', pos1 + 1)) != -1 ) { 
        if (k % 2 == 0){
            rawpos[k] = pos1 + 4;
        } else {
            rawpos[k] = pos1;
        }
        k++;
    }

    let pos2 = -1;
    let l = 0;

    while( (pos2 = md.indexOf('\n```', pos2 + 1)) != -1 ) { 
        if (l % 2 == 0){
            mdpos[l] = pos2 - 1;
        } else {
            mdpos[l] = pos2 + 5;
        }
        l++;
    }

    for (var i = 0; i < mdpos.length; i++){
        if (i % 2 == 0){

            console.log(md.substring(mdpos[i] - diff[i], mdpos[i+1] - diff[i]))

            md = md.replace(md.substring(mdpos[i] - diff[i], mdpos[i+1] - diff[i]), '<pre class="code">'+md0.substring(rawpos[i], rawpos[i+1])+'</pre>');

            var mdSubStringLength = mdpos[i+1] - mdpos[i];
            var rawSubStringLength = rawpos[i+1] - rawpos[i] + '<pre class="code">'.length + '</pre>'.length;
            diff[i+2] = diff[i] + mdSubStringLength - rawSubStringLength;

            console.log(diff)
        }
    }

    //br
    md = md.replace(/\n\n\n/g, '</p><p> </p><p>');
    md = md.replace(/\n\n/g, '</p><p>');
    
    return md;
    
}

function parseToJSON(md){

    md = md.replace(/\"/gm, "&quot;").replace(/\'/gm, "&#39;").replace(/\]/gm, "&rbrack;").replace(/\[/gm, "&lbrack;");
    md = "[\n"+md+"\n]"

    md = md.replace(/\n[\#]{6}(.+)/g, '\n$1');
    md = md.replace(/\n[\#]{5}(.+)/g, '\n$1');
    md = md.replace(/\n[\#]{4}(.+)/g, '\n$1');
    md = md.replace(/\n[\#]{3}(.+)/g, '\n**$1**');
    md = md.replace(/\n[\#]{2}(.+)/g, '\n\$[x2$1]');
    md = md.replace(/\n[\#]{1}(.+)/g, ',{"type": "section", "title": "$1", "children": []}');

    md = md.replace(/\}\n([\s\S][^\{]+)\,\{/g, '},{"type": "text", "text": "$1"},{')
    md = md.replace(/\[\n([\s\S][^\{]+)\,\{/g, '[{"type": "text", "text": "$1"},{')
    md = md.replace(/\}\n([\s\S][^\{]+)\]/g, '},{"type": "text", "text": "$1"}]')

    md = md.replace(/\[\n([\s\S][^\{]+)\]/g, '[{"type": "text", "text": "$1"}]')
    md = md.replace(/\[\,\{/g, '[{')
    md = md.replace(/\n/g, '&nbsp;')

    mdJson = JSON.parse(md)

    for (var i=0; i<mdJson.length; i++) {
        if (mdJson[i].type == 'text') {
            mdJson[i].text = mdJson[i].text.replace(/\&quot\;/gm, '"').replace(/\&\#39\;/gm, "'").replace(/\&rbrack\;/gm, "]").replace(/\&lbrack\;/gm, "[").replace(/\&nbsp\;/gm, "\n")
        }
    }

    return mdJson;
}

const parseMFM = (md, mfmhost) => {
    // MFM으로 작성된 텍스트를 마크다운으로 변환하는 코드입니다.

    const md0 = md.replace(/\</gm,"&lt;").replace(/\>/gm, "&gt;").replace(/\`/gm, "&grave;").replace(/\-/gm, "&dash;").replace(/\*/gm, "&ast;").replace(/\#/gm, "&num;").replace(/\~/gm, "&tilde;").replace(/\]/gm, "&rbrack;").replace(/\:/gm, "&colon;").replace(/\//gm, "&sol;");
    
    //h
    md = md.replace(/\n\$\[x2\s([^\]]+)\]/gm, '\n## $1');
    //h
    md = md.replace(/\n\$\[([^\]]+)\]/gm, '\n$1');
    
    //links
    md = md.replace(/\?\[/gm, '[');

    //pre
    
    var mdpos = [];
    var rawpos = [];
    let pos1 = -1;
    let k = 0;

    var diff = [0]

    while( (pos1 = md0.indexOf('\n&grave;&grave;&grave;', pos1 + 1)) != -1 ) { 
        if (k % 2 == 0){
            rawpos[k] = pos1 + 22;
        } else {
            rawpos[k] = pos1;
        }
        k++;
    }

    let pos2 = -1;
    let l = 0;

    while( (pos2 = md.indexOf('\n```', pos2 + 1)) != -1 ) { 
        if (l % 2 == 0){
            mdpos[l] = pos2 ;
        } else {
            mdpos[l] = pos2 + 5;
        }
        l++;
    }

    for (var i = 0; i < mdpos.length; i++){
        if (i % 2 == 0){

            md = md.replace(md.substring(mdpos[i] - diff[i], mdpos[i+1] - diff[i]), '\n<pre class="code">'+md0.substring(rawpos[i], rawpos[i+1])+'</pre>\n');

            var mdSubStringLength = mdpos[i+1] - mdpos[i];
            var rawSubStringLength = rawpos[i+1] - rawpos[i] + '\n<pre class="code">'.length + '</pre>\n'.length;
            diff[i+2] = diff[i] + mdSubStringLength - rawSubStringLength;

        }
    }

    return md;
}

function getQueryStringObject() {
    var a = window.location.search.substr(1).split('&');
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i) {
        var p = a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
}

var qs = getQueryStringObject();
var blog = qs.b;
var page = qs.p;
var signinHost = qs.h;
var category = qs.cat;
var article = qs.a;

if (!blog && !page) {
    var url = "https://raw.githubusercontent.com/"+githubUserName+"/"+githubRepoName+"/main/README.md"
    fetch(url)
    .then(res => res.text())
    .then((out) => {
        document.querySelector("#page_title").innerText = 'HOME'
        document.querySelector("#page_content").innerHTML += parseMd(out)
        const findUserNotesUrl = 'https://'+initialHost+'/api/notes/search-by-tag'
        const findUserNotesParam = {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body:  JSON.stringify({
                tag: 'MiLogSetup',
                limit: 100,
            }),
        }
        fetch(findUserNotesUrl, findUserNotesParam)
        .then((noteData) => {return noteData.json()})
        .then((noteRes) => {

            var blogs = []
            var blogPosts = []
            var filteredPosts = []

            const loadUsersFunc = async() => {

                for (let result of noteRes) {
                    await loadUsers(result);
                }

                blogPosts.sort(function(a, b) {

                    if(a.createdAt > b.createdAt) return -1;
                    if(a.createdAt < b.createdAt) return 1;
                    if(a.createdAt === b.createdAt) return 0;
                });

                console.log(blogPosts)

                document.querySelector("#page_content").innerHTML += '<div id="postlist"></div>'
                
                for (let post of blogPosts) {
                    await filterPosts(post);
                }

            }

            const loadUsers = (res) => {
                return new Promise((resolve, reject) => {
                    var resulthost = res.user.host
                    console.log(res)
                    if (!resulthost) {
                        resulthost = initialHost
                    }
                    var findUserIdUrl = 'https://'+resulthost+'/api/users/search-by-username-and-host'
                    var findUserIdParam = {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json',
                        },
                        body:  JSON.stringify({
                            username: res.user.username,
                            host: resulthost,
                        })
                    }
                    fetch(findUserIdUrl, findUserIdParam)
                    .then((userData) => {return userData.json()})
                    .then((userRes) => {
                        var blogInfo = {
                            url: res.text.split(' ')[0],
                            userId: userRes[0].id,
                            username: res.user.username,
                            host: resulthost
                        }
                        blogs.push(blogInfo)
                        var findPostsUrl = 'https://'+blogInfo.host+'/api/users/pages'
                        var findPostParam = {
                            method: 'POST',
                            headers: {
                                'content-type': 'application/json',
                            },
                            body:  JSON.stringify({
                                userId: blogInfo.userId,
                            })
                        }
                        fetch(findPostsUrl, findPostParam)
                        .then((postData) => {return postData.json()})
                        .then((postRes) => {
                            for (var i=0; i<postRes.length; i++) {
                                if (postRes[i].summary.includes('#MiLog ')) {
                                    postRes[i].user.host = resulthost
                                    blogPosts.push(postRes[i])
                                }
                            }
                            resolve()
                        })
                        .catch(err => {throw err});
                    })
                    .catch(err => {throw err});
                })
            }

            const filterPosts = (post) => {
                return new Promise((resolve, reject) => {
                    var eyeCatchUrl = ''
                    var userhost = ''
                    if (!post.eyeCatchingImage) {
                        eyeCatchUrl = 'https://www.eclosio.ong/wp-content/uploads/2018/08/default.png'
                    } else {
                        eyeCatchUrl = post.eyeCatchingImage.url
                    }
                    if (!post.user.host) {
                        userhost = initialHost
                    } else {
                        userhost = post.user.host
                    }
                    document.querySelector("#postlist").innerHTML += '<div class="postlist"><a href="'+domainName+'?b='+post.user.username+'@'+userhost+'&a='+post.id+'"><div><img class="eyecatch" src="'+eyeCatchUrl+'"></div><div class="post_title">'+post.title+'</div></a><div class="post_summary">'+post.summary+'</div><div class="post_author">@'+post.user.username+'@'+userhost+'</div></div>'
                    resolve()
                })
            }

            loadUsersFunc()
        })
        .catch(err => {throw err});
    })
    .catch(err => { throw err });
} else if (page == 'signin' && signinHost != null) {
    if (localStorage.getItem("sessionId")) {
        location.href = domainName+'?p=signout'
    } else {
        let uuid = self.crypto.randomUUID();
        localStorage.setItem("signinHost", signinHost);
        localStorage.setItem("sessionId", uuid);
        var signinUrl = 'https://'+signinHost+'/miauth/'+uuid+'?name=MiLog&callback=https%3A%2F%2Fyeojibur.in%2FMilog%3Fp%3Dcallback&permission=write:notes,write:pages,write:drive'
        location.href = signinUrl;
    }
} else if (page == 'signin' && !signinHost) {
    if (localStorage.getItem("sessionId")) {
        location.href = domainName
    } else {
        document.querySelector("#page_title").innerText = 'SIGN IN'
        document.querySelector("#page_content").innerHTML = '<div><input id="host" placeholder="계정이 있는 인스턴스 주소"></input><div class="button" id="signinButton">로그인</div></div>'

        var signHost = document.getElementById('host');
        var signinButton = document.getElementById('signinButton');

        signinButton.addEventListener('click', function(event) {
            location.href = domainName + '?p=signin&h=' + signHost.value
        })
    }
} else if (page == 'callback') {
    const sessionId = localStorage.getItem("sessionId");
    const signinHost = localStorage.getItem("signinHost");
    if (sessionId && signinHost) {
        var postUrl = 'https://'+signinHost+'/api/miauth/'+sessionId+'/check'
        var postParam = {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({})
        }
        fetch(postUrl, postParam)
        .then((tokenData) => {return tokenData.json()})
        .then((tokenRes) => {
            localStorage.setItem("token", tokenRes.token)
            localStorage.setItem("username", tokenRes.user.username)
            localStorage.setItem("userid", tokenRes.user.id)
    
            var findInfoUrl = 'https://'+signinHost+'/api/notes/search'
            var findInfoParam = {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    query: 'MiLogSetup',
                    userId: tokenRes.user.id,
                })
            }
            fetch(findInfoUrl, findInfoParam)
            .then((infoData) => {return infoData.json()})
            .then((infoRes) => {
                if (infoRes.length == 0) {
                    var createPageUrl = 'https://'+signinHost+'/api/pages/create'
                    var createPageParam = {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json',
                        },
                        body: JSON.stringify({
                            i: tokenRes.token,
                            title: 'MiLogSetup',
                            name: 'milogsetup',
                            summary: '#MiLogSetup',
                            variables: [],
                            script: '',
                            content: [{
                                text: 'blogTitle: '+tokenRes.user.username+'.log\n\nblogIntro: @'+tokenRes.user.username+'@'+signinHost+'의 블로그입니다.\n\nfollowing: ',
                                type: 'text'
                            }]
                        })
                    }
                    fetch(createPageUrl, createPageParam)
                    .then((pageData) => {return pageData.json()})
                    .then((pageRes) => {

                        console.log(pageRes)
                        var createNoteUrl = 'https://'+signinHost+'/api/notes/create'
                        var createNoteParam = {
                            method: 'POST',
                            headers: {
                                'content-type': 'application/json',
                            },
                            body: JSON.stringify({
                                i: tokenRes.token,
                                visibility: 'home',
                                text: 'https://'+signinHost+'/@'+tokenRes.user.username+'/pages/milogsetup #MiLogSetup'
                            })
                        }
                        fetch(createNoteUrl, createNoteParam)
                        .then((noteData) => {return noteData.json()})
                        .then((noteRes) => {
                            location.href = domainName
                        })
                        .catch(err => {throw err});
                    })
                    .catch(err => {throw err});
                }
            })
            .catch(err => {throw err});
        })
        .catch(err => {throw err});
    }
    
} else if (blog && !article) {
    var username = blog.split('@')[0]
    var host = blog.split('@')[1]
    var blogPosts = []
    var blogInfo = {}

    console.log(username, host)

    var findUserIdUrl = 'https://'+host+'/api/users/search-by-username-and-host'
    var findUserIdParam = {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body:  JSON.stringify({
            username: username,
            host: host,
        })
    }
    fetch(findUserIdUrl, findUserIdParam)
    .then((userData) => {return userData.json()})
    .then((userRes) => {
        var findInfoUrl = 'https://'+host+'/api/notes/search'
        var findInfoParam = {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body:  JSON.stringify({
                query: 'MiLogSetup',
                userId: userRes[0].id,
            })
        }
        fetch(findInfoUrl, findInfoParam)
        .then((infoData) => {return infoData.json()})
        .then((infoRes) => {
            blogInfo = {
                url: infoRes[0].text.split(' ')[0],
                userId: userRes[0].id,
                username: username,
                host: host
            }
            var findPostsUrl = 'https://'+host+'/api/users/pages'
            var findPostParam = {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body:  JSON.stringify({
                    userId: blogInfo.userId,
                    limit: 100,
                })
            }
            fetch(findPostsUrl, findPostParam)
            .then((postData) => {return postData.json()})
            .then((postRes) => {
                blogPosts = blogPosts + postRes
            })
            .catch(err => {throw err});
        })
        .catch(err => {throw err});
    })
    .catch(err => {throw err});
} else if (blog && article) {
    var username = blog.split('@')[0]
    var host = blog.split('@')[1]

    document.querySelector("#page_title").innerText = 'BLOG'
    const findPageUrl = 'https://'+host+'/api/pages/show'
    const findPageParam = {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            pageId: article,
        }),
    }

    const leaveCommentFunc = async() => {
        await commentFunc()

        if (token) {
            var leaveComment = document.getElementById("leavecomment");
            var commentText = document.getElementById("comment");
    
            console.log(leaveComment)
            console.log(commentText)
    
            leaveComment.addEventListener('click', function(event) {
                if (commentText.value == '') {
                    alert('덧글 내용을 입력해주세요!');
                } else {
                    var leaveCommentUrl = 'https://'+signedHost+'/api/notes/create'
                    var leaveCommentParam = {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json',
                        },
                        body: JSON.stringify({
                            i: token,
                            visibility: 'home',
                            text: '@'+username+'@'+host+' <[MiLog 게시글]('+domainName+'?b='+username+'@'+host+'&a='+article+')에 대한 덧글입니다>\n'+commentText.value,
                        }),
                    }
                    fetch(leaveCommentUrl, leaveCommentParam)
                    .then((leavedcommentData) => {return leavedcommentData.json()})
                    .then((leavedcommentRes) => {
                        location.href = domainName + '?b='+ username +'@'+ host +'&a='+ article
                    })
                    .catch(err => {throw err});
                }
            })
        }
        
    }

    const commentFunc = () => {
        return new Promise((resolve, reject) => {
            fetch(findPageUrl, findPageParam)
            .then((PageData) => {return PageData.json()})
            .then((PageRes) => {

                var result = ''

                const addContent = (content, attFiles) => {
                    return new Promise((resolve, reject) => {
                        if (content.type == 'section') {
                            result += '\n#' + content.title
                            resolve()
                        } else if (content.type == 'text') {
                            var mfm = parseMFM(content.text, host)

                            var emojinames = mfm.match(/\:([^\:\/\`\n\s\(\)\,\-]+)\:/g);
                            var emojiurl = []

                            const insertEmojiUrl = (name) => {
                                return new Promise((resolve2, reject) => {
                                    var searchEmojiUrl = 'https://'+host+'/api/emoji'
                                    var searchEmojiParam = {
                                        method: 'POST',
                                        headers: {
                                            'content-type': 'application/json',
                                        },
                                        body:  JSON.stringify({
                                            name: name
                                        })
                                    }
                                    fetch(searchEmojiUrl, searchEmojiParam)
                                    .then((emojiData) => {return emojiData.json()})
                                    .then((emojiRes) => {
                                        emojiurl.push(emojiRes.url)
                                        mfm = mfm.replace(':'+name+':', '<img src="'+emojiRes.url+'" class="emoji">')
                                        result += '\n' + mfm
                                        console.log(result)
                                        resolve2()
                                    })
                                    .catch(err => {throw err});
                                })
                            }

                            const insertEmoji = async(emojinames) => {
                                if (emojinames) {
                                    for (let emojiname of emojinames) {
                                        await insertEmojiUrl(emojiname.substring(1, emojiname.length - 1))
                                        console.log('에모지 출력')
                                    }
                                } else {
                                    console.log('null')
                                    result += '\n' + mfm
                                }
                                resolve()
                            }
                            
                            insertEmoji(emojinames)
                            
                        } else if (content.type == 'image') {
                            var fileId = content.fileId
                            var fileUrl = ''
                            for (var k = 0; k <attFiles.length; k++){
                                if (attFiles[k].id == fileId) {
                                    fileUrl = attFiles[k].url
                                }
                            }
                            result += '\n<div class="gallery"><img class="postimage" src="' + fileUrl + '"></div>'
                            resolve()
                        } else if (content.type == 'note') {
                            result += '\n<div>[노트 참조](https://'+host+'/notes/' + noteId + ')</div>'
                            resolve()
                        }
                        
                    })
                }

                const makePageText = async(contents, attFiles) => {

                    for (let content of contents) {
                        await addContent(content, attFiles)
                    }

                    document.querySelector("#page_title").innerText = pageTitle
                    document.querySelector("#post_content").innerHTML += '<div><a href="'+pageUrl+'"><img class="eyecatchimg" src="'+pageImage+'"></div>'
                    console.log(result)
                    document.querySelector("#post_content").innerHTML += '<div>'+PageRes.createdAt+'</div>'
                    document.querySelector("#post_content").innerHTML += parseMd(result)

                }

                var pageUrl = "https://"+host+"/@"+username+"/pages/"+PageRes.name
                var pageTitle = PageRes.title
                var pageImage = ''
                if (PageRes.eyeCatchingImage) {
                    pageImage = PageRes.eyeCatchingImage.url
                } else {
                    pageImage = 'https://www.eclosio.ong/wp-content/uploads/2018/08/default.png'
                }
                document.querySelector("#page_content").innerHTML += '<div id="post_content"></div>'
                makePageText(PageRes.content, PageRes.attachedFiles)
                if (signedusername == username && signedHost == host) {
                    document.querySelector("#page_content").innerHTML += '<div id="tools"><a href="./?p=update"><div class="button" id="update&a='+article+'">수정</div></a> <a href="./?p=delete&a='+article+'"><div class="button" id="delete">삭제</div></a></div>'
                } 
                document.querySelector("#page_content").innerHTML += '<div id="commentbox"><div>'
                if (token) {
                    document.getElementById("commentbox").innerHTML = '<textarea id="comment" placeholder="덧글을 작성해보세요. 작성된 덧글은 수정하기 어렵습니다."></textarea><div class="button" id="leavecomment">덧글 작성</div>'
                }
                const findCommentUrl = 'https://'+host+'/api/notes/search'
                const findCommentParam = {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: article,
                    }),
                }
                fetch(findCommentUrl, findCommentParam)
                .then((commentData) => {return commentData.json()})
                .then((commentRes) => {
                    if (commentRes.length > 0) {
                        for (var i=0; i<commentRes.length; i++) {
                            var commentUserHost = ''
                            if (commentRes[i].user.host) {
                                commentUserHost = commentRes[i].user.host
                            } else {
                                commentUserHost = host
                            }
                            var commentText = commentRes[i].text.substr(commentRes[i].text.indexOf('\n'))
                            document.querySelector("#commentbox").innerHTML += '<div class="commentList"><div class="commentUser">@'+commentRes[i].user.username+'@'+commentUserHost+'</div><div class="commentText">'+parseMFM(commentText, commentUserHost)+'</div></div>'
                        }
                    } else {
                        document.querySelector("#commentbox").innerHTML += '<div class="commentList">작성된 덧글이 없습니다.</div>'
                    }
                    resolve()
                })
                .catch(err => {throw err});
                
            })
            .catch(err => { throw err });
            
        })
    }

    leaveCommentFunc()
    
} else if (page == 'signout') {
    localStorage.clear();
    location.href = domainName
} else if (page == 'editor') {

    const sessionId = localStorage.getItem("sessionId");
    const userid = localStorage.getItem("userid");
    var eyeCatchImgId = ''

    if (token) {
        document.querySelector('#page_content').innerHTML = '<div class="editor_container"><div class="editor"><input id="postTitle" placeholder="제목을 입력해주세요"></input><div id="eyeCatchImg">배경 사진을 선택해주세요</div><input id="postCategory" placeholder="카테고리를 입력해주세요"></input><input id="postUrl" placeholder="url을 지정해주세요"></input><div id="imgupload">📷</div><textarea id="editor" placeholder="내용을 입력해주세요"></textarea></div><div class="parser"><div id="imagepreview"></div><div id="titlepreview"></div><div id="contentpreview"></div></div></div><div class="button" id="postButton">게시</div>'
        document.querySelector('#page_content').innerHTML += '<input type="file" id="eyecatchrealupload" accept="image/*" style="display: none;"><input type="file" id="imgrealupload" accept="image/*" style="display: none;">'

        var emojinames = []
        var emojiurl = {}

        var editor = document.getElementById('editor');
        editor.addEventListener('keyup', function(event){
            
            resultHTML = parseMd(editor.value)

            if (event.key == ':') {
                if (resultHTML.match(/\:([^\:\/\`\n\s\(\)\,\-]+)\:/g)) {
                    emojinames = resultHTML.match(/\:([^\:\/\`\n\s\(\)\,\-]+)\:/g)
                }
    
                const insertEmojiUrl = (name) => {
                    return new Promise((resolve, reject) => {
                        var searchEmojiUrl = 'https://'+signedHost+'/api/emoji'
                        var searchEmojiParam = {
                            method: 'POST',
                            headers: {
                                'content-type': 'application/json',
                            },
                            body:  JSON.stringify({
                                name: name
                            })
                        }
                        fetch(searchEmojiUrl, searchEmojiParam)
                        .then((emojiData) => {return emojiData.json()})
                        .then((emojiRes) => {
                            emojiurl[name] = emojiRes.url
                            if (emojiurl[name] && emojiurl[name] !== 'undefined') {
                                resultHTML = resultHTML.replace(':'+name+':', '<img src="'+emojiRes.url+'" class="emoji">')
                            }
                            resolve()
                        })
                        .catch(err => {throw err});
                    })
                }

                const insertEmoji = async(emojinames) => {
                    if (emojinames) {
                        for (let emojiname of emojinames) {
                            await insertEmojiUrl(emojiname.substring(1, emojiname.length - 1))
                        }
                    }
                    
                    document.querySelector('#contentpreview').innerHTML = resultHTML
                }
                
                insertEmoji(emojinames)
            } else {
                for (let i = 0; i < emojinames.length; i++) {
                    if (emojiurl[emojinames[i].substring(1, emojinames[i].length - 1)] && emojiurl[emojinames[i].substring(1, emojinames[i].length - 1)] !== 'undefined') {
                        resultHTML = resultHTML.replace(emojinames[i], '<img src="'+emojiurl[emojinames[i].substring(1, emojinames[i].length - 1)]+'" class="emoji">')
                    }
                }
                document.querySelector('#contentpreview').innerHTML = resultHTML
            }
        })

        var title = document.getElementById('postTitle');
        title.addEventListener('keyup', function(event){
            document.querySelector('#titlepreview').innerHTML = parseMd(title.value)
        })

        const insertText = (text) => {
            var position = editor.selectionStart;
            editor.setRangeText(text, position, position, 'select');
        };

        var eyeCatchRealUpload = document.querySelector('#eyecatchrealupload')
        var imgRealUpload = document.querySelector('#imgrealupload')
        var eyeCatchUpload = document.querySelector('#eyeCatchImg')
        var imgUpload = document.querySelector('#imgupload')
        var imagePreview = document.querySelector('#imagepreview')

        eyeCatchUpload.addEventListener('click', () => eyeCatchRealUpload.click())
        imgUpload.addEventListener('click', () => imgRealUpload.click())

        eyeCatchRealUpload.addEventListener('change', function(e) {
            var files = e.currentTarget.files;
            eyeCatchUpload.innerText = files[0].name

            var imgReader = new FileReader();
            imgReader.onload = (e) => {
                console.log(e.target.result)
                imagePreview.innerHTML = '<img src="'+e.target.result+'">'
            };
            imgReader.readAsDataURL(this.files[0]);

            var eyeCatchUrl = 'https://'+signedHost+'/api/drive/files/create'
            var eyeCatchParam = {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body:  JSON.stringify({
                    i: token,
                    file: files[0]
                })
            }
            fetch(eyeCatchUrl, eyeCatchParam)
            .then((eyecatchData) => {return eyecatchData.json()})
            .then((eyecatchRes) => {
                eyeCatchImgId = eyecatchRes.id
            })
            .catch(err => {throw err});
        })

        imgRealUpload.addEventListener('change', function(e) {
            var file = e.currentTarget.files;
            var imgUploadURL = 'https://'+signedHost+'/api/drive/files/create'
            var imgUploadParam = {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body:  JSON.stringify({
                    i: token,
                    file: file[0]
                })
            }
            fetch(imgUploadURL, imgUploadParam)
            .then((eyecatchData) => {return eyecatchData.json()})
            .then((eyecatchRes) => {
                insertText('![]('+eyecatchRes.id+')')
            })
            .catch(err => {throw err});
        })
    
        var postButton = document.getElementById('postButton');
        var postTitle = document.getElementById('postTitle');
        var postCategory = document.getElementById('postCategory');
        var postUrl = document.getElementById('postUrl');
        postButton.addEventListener('click', function(event) {
            if (postTitle.value == '' || postUrl.value == '' || postCategory.value == '' || editor.value == '') {
                alert("빈칸을 모두 채워주세요!");
            } else {
                var postCreateUrl = 'https://'+signedHost+'/api/pages/create'
                var postCreateParam = {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body:  JSON.stringify({
                        i: token,
                        title: postTitle.value,
                        name: postUrl.value,
                        summary: '#MiLog #'+postCategory.value,
                        variables: [],
                        script: '',
                        content: parseToJSON(editor.value),
                        eyeCatchingImageId: eyeCatchImgId
                    })
                }
                fetch(postCreateUrl, postCreateParam)
                .then((postData) => {return postData.json()})
                .then((postRes) => {
                    location.href = domainName + '?b='+ signedusername +'@'+ signedHost +'&a='+ postRes.id
                })
                .catch(err => {throw err});
            }
        })
    } else {
        location.href = domainName + '?p=signin'
    }

} else if (page == 'delete' && article != null ) {
    if (token) {
        if (window.confirm("정말 글을 삭제하시겠습니까?")) {
            const deletePostUrl = 'https://'+signedHost+'/api/pages/delete'
            const deletePostParam = {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    i: token,
                    pageId: article,
                }),
            }
            fetch(deletePostUrl, deletePostParam)
                .then((postData) => {return postData.json()})
                .then((postRes) => {
                    location.href = domainName + '?b='+ signedusername +'@'+ signedHost
                })
                .catch(err => {throw err});
        } else {
            location.href = domainName + '?b='+ signedusername +'@'+ signedHost +'&a='+ article
        }
    } else {
        alert("권한이 없습니다.")
        location.href = domainName
    }
} else if (page == 'blog' && category != null) {
    document.querySelector("#page_title").innerText = category
    const findPageUrl = 'https://'+host+'/api/users/pages'
    const findPageParam = {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            userId: misskeyUserId,
            limit: 100,
        }),
    }
    fetch(findPageUrl, findPageParam)
    .then((PageData) => {return PageData.json()})
    .then((PageRes) => {
        var pageId = []
        var pageUrl = []
        var pageTitle = []
        var pageSummary = []
        var pageImage = []
        for (var i=0; i<PageRes.length; i++){
            if (PageRes[i].summary && PageRes[i].summary.includes("#"+category)) {
                pageId.push(PageRes[i].id)
                pageUrl.push("https://"+host+"/@"+misskeyUserName+"/pages/"+PageRes[i].name)
                pageTitle.push(PageRes[i].title)
                if (PageRes[i].summary != null) {
                    pageSummary.push(PageRes[i].summary)
                } else {
                    pageSummary.push('')
                }
                pageImage.push(PageRes[i].eyeCatchingImage.url)
            }
        }
        for (var i=0; i<pageTitle.length; i++) {
            document.querySelector("#page_content").innerHTML += '<div class="section"></div>'
            document.getElementsByClassName("section")[i].innerHTML += '<div class="blogpage_title"><a href="?p=blog&a='+pageId[i]+'">'+pageTitle[i]+'</a></div>'
            document.getElementsByClassName("section")[i].innerHTML += '<div><a href="?p=blog&a='+pageId[i]+'"><img class="eyecatchimg" src="'+pageImage[i]+'"></div>'
            document.getElementsByClassName("section")[i].innerHTML += '<div>'+pageSummary[i]+'</div>'
        }
    })
    .catch(err => { throw err });
} else if (page) {
    var url = "https://raw.githubusercontent.com/"+githubUserName+"/"+githubRepoName+"/main/pages/"+page+".md"
    fetch(url)
    .then(res => res.text())
    .then((out) => {
        document.querySelector("#page_title").innerText = page
        document.querySelector("#page_content").innerHTML += parseMd(out)
    })
    .catch(err => { throw err });
}