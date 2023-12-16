const initialHost = 'i.peacht.art' // 처음 불러올 때 호스트
const githubUserName = 'jyhyun1008' // 깃허브 아이디
const githubRepoName = 'Milog' // 깃허브 레포지토리 이름
const domainName = 'https://milog.yna.bz' // 도메인

const sessionId = localStorage.getItem("sessionId");
const signedHost = localStorage.getItem("signinHost");
const token = localStorage.getItem("token");
const signedusername = localStorage.getItem("username");

const signedBlogInfoId = localStorage.getItem('blogInfoId')
var signedBlogInfo = JSON.parse(localStorage.getItem('blogInfo'))

var cssRoot = document.querySelector(':root');

var isLogin = false;
if (sessionId && signedHost) {
    isLogin = true;
    document.getElementsByClassName('nav-item')[0].innerHTML += '<div class="item"><a href="./?b='+signedusername+'@'+signedHost+'"><i class="bx bx-home"></i></a></div>'
    document.getElementsByClassName('nav-item')[0].innerHTML += '<div class="float-right"><a href="./?p=editor"><div class="button" id="editorbt"><i class="bx bx-edit-alt"></i></div></a><a href="./?p=signout"><div class="button" id="loginout"><i class="bx bx-log-out" ></i></div></a></div>'
    if (signedBlogInfo) {
        cssRoot.style.setProperty('--accent', signedBlogInfo.theme)
    } else {
        cssRoot.style.setProperty('--accent', '#3EB489')
    }
} else {
    document.getElementsByClassName('nav-item')[0].innerHTML += '<div class="float-right"><a href="./?p=signin"><div class="button" id="loginout"><i class="bx bx-log-in" ></i></div></a></div>'
    cssRoot.style.setProperty('--accent', '#3EB489')
}

function parseMd(md){ // 깃허브 등에 사용하는 마크다운 파일을 html로 변환시켜 줍니다.
    // 정규식으로 되어 있습니다. 자세한 것은 정규식을 공부해 주세요.

    md = "\n"+md
    const md0 = md.replace(/\</gm,"&lt;").replace(/\>/gm, "&gt;");

    //루비
    md = md.replace(/\$\[ruby\s([^\]]+)\s([^\]]+)\]/gm, '<ruby>$1<rp>(</rp><rt>$2</rt><rp>)</rp></ruby>');
  
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
    md = md.replace(/\n[\#]{1}(.+)/g, ',{"type": "section", "title": "$1", "children": &lbrack;&rbrack;}');

    md = md.replace(/\n\!\&lbrack\;([^\(\&\;]+)\&rbrack\;\(([^\(\&\;]+)\)\n/g, ',{"type": "image", "fileId": "$1"}')

    md = md.replace(/\}\n([\s\S][^\{]+)\,\{/g, '},{"type": "text", "text": "$1"},{')
    md = md.replace(/\[([\s\S][^\{]+)\,\{/g, '[{"type": "text", "text": "$1"},{')
    md = md.replace(/\}\n([\s\S][^\{]+)\]/g, '},{"type": "text", "text": "$1"}]')

    md = md.replace(/\[([\s\S][^\{]+)\]/g, '[{"type": "text", "text": "$1"}]')
    md = md.replace(/\[\,\{/g, '[{')
    md = md.replace(/\n/g, '&nbsp;').replace(/\"children\"\:\s\&lbrack\;\&rbrack\;\}/gm, '"children": []}')

    mdJson = JSON.parse(md)

    for (var i=0; i<mdJson.length; i++) {
        if (mdJson[i].type == 'text') {
            mdJson[i].text = mdJson[i].text.replace(/\&quot\;/gm, '"').replace(/\&\#39\;/gm, "'").replace(/\&rbrack\;/gm, "]").replace(/\&lbrack\;/gm, "[").replace(/\&nbsp\;/gm, "\n")
        }
    }

    return mdJson;
}

const parseMFM = (md) => {
    // MFM으로 작성된 텍스트를 마크다운으로 변환하는 코드입니다.

    const md0 = md.replace(/\</gm,"&lt;").replace(/\>/gm, "&gt;").replace(/\`/gm, "&grave;").replace(/\-/gm, "&dash;").replace(/\*/gm, "&ast;").replace(/\#/gm, "&num;").replace(/\~/gm, "&tilde;").replace(/\]/gm, "&rbrack;").replace(/\:/gm, "&colon;").replace(/\//gm, "&sol;");
    
    //h
    md = md.replace(/\n\$\[x2\s([^\]]+)\]/gm, '\n## $1');
    //루비
    md = md.replace(/\$\[ruby\s([^\]]+)\s([^\]]+)\]/gm, '<ruby>$1<rp>(</rp><rt>$2</rt><rp>)</rp></ruby>');
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

function convertDataURIToBinary(dataURI) {
	var BASE64_MARKER = ';base64,';
	var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
	var base64 = dataURI.substring(base64Index);
	var raw = window.atob(base64);
	return raw;
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
        document.querySelector("#page_title").innerHTML += '최신 포스트'
        const findUserNotesUrl = 'https://'+initialHost+'/api/notes/search-by-tag'
        const findUserNotesParam = {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body:  JSON.stringify({
                tag: 'MiLogNewPost',
                limit: 20,
            }),
        }
        fetch(findUserNotesUrl, findUserNotesParam)
        .then((noteData) => {return noteData.json()})
        .then((noteRes) => {

            document.querySelector("#page_content").innerHTML += '<div id="postlist"></div>'

            const loadPostFunc = async() => {
                for (let result of noteRes) {
                    await loadPosts(result);
                }
            }

            const loadPosts = (res) => {
                return new Promise((resolve, reject) => {
                    var pageId = res.text.split('&a=')[1].split(')')[0]
                    var resultusername = res.user.username
                    var resulthost = res.user.host
                    if (!resulthost) {
                        resulthost = initialHost
                    }
                    var loadPostUrl = 'https://'+resulthost+'/api/pages/show'
                    var loadPostParam = {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json',
                        },
                        body:  JSON.stringify({
                            pageId: pageId,
                        })
                    }
                    fetch(loadPostUrl, loadPostParam)
                    .then((postData) => {return postData.json()})
                    .then((postRes) => {
                        var title = postRes.title
                        var category = postRes.summary.split(' #')[1]
                        var eyeCatchUrl = ''
                        if (!postRes.eyeCatchingImage) {
                            eyeCatchUrl = 'https://www.eclosio.ong/wp-content/uploads/2018/08/default.png'
                        } else {
                            eyeCatchUrl = postRes.eyeCatchingImage.url
                        }
                        document.querySelector("#postlist").innerHTML += '<div class="postlist"><a class="nodeco" href="'+domainName+'?b='+resultusername+'@'+resulthost+'&a='+pageId+'"><div><img class="eyecatch" src="'+eyeCatchUrl+'"></div><div class="post_title">'+title+'</div></a><div class="post_summary">'+category+'</div><div class="post_author">@'+resultusername+'@'+resulthost+'</div></div>'
                        resolve()
                    })
                })
            }

            loadPostFunc()
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
        var signinUrl = 'https://'+signinHost+'/miauth/'+uuid+'?name=MiLog&callback=https%3A%2F%2Fyeojibur.in%2FMilog%3Fp%3Dcallback&permission=write:notes,write:pages,write:drive,write:account'
        location.href = signinUrl;
    }
} else if (page == 'signin' && !signinHost) {
    if (localStorage.getItem("sessionId")) {
        location.href = domainName
    } else {
        document.querySelector("#page_title").innerText = '로그인'
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
                    var createAntennaUrl = 'https://'+signinHost+'/api/antennas/create'
                    var createAntennaParam = {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json',
                        },
                        body: JSON.stringify({
                            i: tokenRes.token,
                            name: "MiLogFollowingAntenna",
                            src: "users",
                            keywords: [[`#MiLogNewPost`]],
                            excludeKeywords: [[]],
                            users: [`@`+tokenRes.user.username+`@`+signinHost],
                            caseSensitive: false,
                            withReplies: false,
                            withFile: false,
                            notify: false
                        })
                    }
                    fetch(createAntennaUrl, createAntennaParam)
                    .then((antennaData) => {return antennaData.json()})
                    .then((antennaRes) => {
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
                                    text: 'Setting: `{"blogTitle": "'+tokenRes.user.username+'.log", "blogIntro": "@'+tokenRes.user.username+'@'+signinHost+'의 블로그입니다.", "theme": "#86b300", "category": ["미분류"], "following": "'+antennaRes.id+'"}`',
                                    type: 'text'
                                }]
                            })
                        }
                        fetch(createPageUrl, createPageParam)
                        .then((pageData) => {return pageData.json()})
                        .then((pageRes) => {
                            localStorage.setItem('blogInfoId', pageRes.id)
                            localStorage.setItem('blogInfo', pageRes.content[0].text.split('`')[1])

                            var createNoteUrl = 'https://'+signinHost+'/api/notes/create'
                            var createNoteParam = {
                                method: 'POST',
                                headers: {
                                    'content-type': 'application/json',
                                },
                                body: JSON.stringify({
                                    i: tokenRes.token,
                                    visibility: 'home',
                                    text: '`' + pageRes.id + '` #MiLogSetup'
                                })
                            }
                            fetch(createNoteUrl, createNoteParam)
                            .then((noteData) => {return noteData.json()})
                            .then((noteRes) => {
                                //location.href = domainName
                            })
                            .catch(err => {throw err});
                        })
                        .catch(err => {throw err});
                    })
                    .catch(err => {throw err});
                } else if (infoRes.length == 1) {
                    var blogInfoId = infoRes[0].text.split('`')[1]
                    var ShowPageUrl = 'https://'+signinHost+'/api/pages/show'
                    var ShowPageParam = {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json',
                        },
                        body: JSON.stringify({
                            pageId: blogInfoId
                        })
                    }
                    fetch(ShowPageUrl, ShowPageParam)
                        .then((page2Data) => {return page2Data.json()})
                        .then((page2Res) => {
                            localStorage.setItem('blogInfoId', blogInfoId)
                            localStorage.setItem('blogInfo', page2Res.content[0].text.split('`')[1])
                            location.href = domainName
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
    var lastVisited = JSON.parse(localStorage.getItem('lastVisited'))
    if (!lastVisited) {
        lastVisited = {
            blog: ''
        }
    }

    var lastPost = ''
    var postList = []

    document.querySelector('#page_title').style.paddingBottom = "0px"

    const loadPostFunc = async() => {
        for (let result of postList) {
            await loadPosts(result);
        }
    }

    const loadPosts = (res) => {
        return new Promise((resolve, reject) => {
            var title = res.title
            var category = res.summary.split(' #')[1]
            var eyeCatchUrl = ''
            if (!res.eyeCatchingImage) {
                eyeCatchUrl = 'https://www.eclosio.ong/wp-content/uploads/2018/08/default.png'
            } else {
                eyeCatchUrl = res.eyeCatchingImage.url
            }
            document.querySelector("#postlist").innerHTML += '<div class="postlist"><a class="nodeco" href="'+domainName+'?b='+username+'@'+host+'&a='+res.id+'"><div><img class="eyecatch" src="'+eyeCatchUrl+'"></div><div class="post_title">'+title+'</div></a><div class="post_summary">'+category+'</div></div>'
            resolve()
        })
    }
    
    function loadPostsbyCategory(cat, last = '') {
        if (cat != '전체글'){
            var findPostsUrl = 'https://'+host+'/api/users/pages'
            if (last != '') {
                var findPostParam = {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body:  JSON.stringify({
                        userId: lastVisited.userId,
                        untilId: last,
                        limit: 100,
                    })
                }
            } else {
                var findPostParam = {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body:  JSON.stringify({
                        userId: lastVisited.userId,
                        limit: 100,
                    })
                }
            }
            fetch(findPostsUrl, findPostParam)
            .then((postData) => {return postData.json()})
            .then((postRes) => {
                var filter = postRes.filter((item) => item.summary !== null)
                var filter2 = filter.filter((item) => item.summary == '#MiLog #' + cat)
                postList = postList.push(...filter2)
                if (filter2.length > 10) {
                    var spliter = filter2.slice(0, 10)
                    postList.push(...spliter)
                    lastPost = postList[10].pageId
                    loadPostFunc()
                } else if (postRes.length == 100 && filter2.length == 10) {
                    postList = postList.push(...filter2)
                    lastPost = postRes[100].pageId
                    loadPostFunc()
                } else if (postRes.length < 100 && filter2.length <= 10) {
                    postList = postList.push(...filter2)
                    lastPost = ''
                    loadPostFunc()
                } else if (postRes.length == 100 && filter2.length < 10) {
                    postList = postList.push(...filter2)
                    lastPost = postRes[100].pageId
                    loadPostsbyCategory(cat, lastPost)
                }
            })
        } else if (cat == '전체글') {
            var findPostsUrl = 'https://'+host+'/api/users/pages'
            if (last != '') {
                var findPostParam = {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body:  JSON.stringify({
                        userId: lastVisited.userId,
                        untilId: last,
                        limit: 100,
                    })
                }
            } else {
                var findPostParam = {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body:  JSON.stringify({
                        userId: lastVisited.userId,
                        limit: 100,
                    })
                }
            }
            fetch(findPostsUrl, findPostParam)
            .then((postData) => {return postData.json()})
            .then((postRes) => {
                var filter = postRes.filter((item) => item.summary !== null)
                var filter2 = filter.filter((item) => item.summary.split('#')[1] == 'MiLog ')
                console.log(filter2)
                if (filter2.length > 10) {
                    var spliter = filter2.slice(0, 10)
                    postList.push(...spliter)
                    lastPost = postList[10].pageId
                    loadPostFunc()
                } else if (postRes.length == 100 && filter2.length == 10) {
                    postList = postList.push(...filter2)
                    lastPost = postRes[100].pageId
                    loadPostFunc()
                } else if (postRes.length < 100 && filter2.length <= 10) {
                    postList = postList.push(...filter2)
                    lastPost = ''
                    console.log(postList)
                    loadPostFunc()
                } else if (postRes.length == 100 && filter2.length < 10) {
                    postList = postList.push(...filter2)
                    lastPost = postRes[100].pageId
                    loadPostsbyCategory(cat, lastPost)
                }
            })
        }
    }

    if (lastVisited.blog != blog) {

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
    
                var blogInfoUrl = 'https://'+host+'/api/pages/show'
                var blogInfoParam = {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body:  JSON.stringify({
                        pageId: infoRes[0].text.split('`')[1]
                    })
                }
                fetch(blogInfoUrl, blogInfoParam)
                .then((pageData) => {return pageData.json()})
                .then((pageRes) => {
                    var blogInfo = JSON.parse(pageRes.content[0].text.split('`')[1])
                    lastVisited = {
                        blog: blog,
                        userId: userRes[0].id,
                        userAvatar: userRes[0].avatarUrl,
                        blogInfo: blogInfo
                    }
                    localStorage.setItem('lastVisited', JSON.stringify(lastVisited))
                    document.querySelector('#page_title').innerHTML = '<div><img id="blogAvatar" src="'+lastVisited.userAvatar+'"></div>'+blogInfo.blogTitle
    
                    if (!page) {
                        document.querySelector("#page_content").innerHTML += '<div class="hline"></div><div id="blogIntro">'+blogInfo.blogIntro+'</div><div id="blogContainer"><div id="blognav"><div class="button selected" id="viewall">전체글</div></div><div id="postlist"></div></div>'
                    } else {
                        document.querySelector("#page_content").innerHTML += '<div class="hline"></div><div id="blogIntro">'+blogInfo.blogIntro+'</div><div id="blogContainer"><div id="blognav"><div class="button" id="viewall">전체글</div></div><div id="postlist"></div></div>'
                    }
                    document.querySelector('#viewall').addEventListener('click', function() {
                        location.href = domainName + '?b=' + blog
                    })
                    
                    for (let i = 0; i < blogInfo.category; i++) {
                        if (blogInfo.category[i] == page) {
                            document.querySelector('#blognav').innerHTML += '<div class="button selected" id="view_'+i.toString()+'">'+blogInfo.category[i]+'</div>'
                        } else {
                            document.querySelector('#blognav').innerHTML += '<div class="button" id="view_'+i.toString()+'">'+blogInfo.category[i]+'</div>'
                        }
                        
                        document.querySelector('#view'+i.toString()).addEventListener('click', function() {
                            location.href = domainName + '?b=' + blog + '&p=' + blogInfo.category[i]
                        })
                    }

                    loadPostsbyCategory(document.querySelector('.selected').innerText)
    
                    // if (postRes.length == 20) {
                    //     lastPost = postRes[19].pageId
                    //     document.querySelector('#blogContainer').innerHTML += '<div class="button">더보기</div>'
    
                    //         //TODO
                    // } 
                })
                .catch(err => {throw err});
            })
            .catch(err => {throw err});
        })
        .catch(err => {throw err});
    } else {

        var blogInfo = lastVisited.blogInfo
        document.querySelector('#page_title').innerHTML = '<div><img id="blogAvatar" src="'+lastVisited.userAvatar+'"></div>'+blogInfo.blogTitle

        var lastPost = ''
        var postList = []
        if (!page) {
            document.querySelector("#page_content").innerHTML += '<div class="hline"></div><div id="blogIntro">'+blogInfo.blogIntro+'</div><div id="blogContainer"><div id="blognav"><div class="button selected" id="viewall">전체글</div></div><div id="postlist"></div></div>'
        } else {
            document.querySelector("#page_content").innerHTML += '<div class="hline"></div><div id="blogIntro">'+blogInfo.blogIntro+'</div><div id="blogContainer"><div id="blognav"><div class="button" id="viewall">전체글</div></div><div id="postlist"></div></div>'
        }
        document.querySelector('#viewall').addEventListener('click', function() {
            location.href = domainName + '?b=' + blog
        })
        
        for (let i = 0; i < blogInfo.category; i++) {
            if (blogInfo.category[i] == page) {
                document.querySelector('#blognav').innerHTML += '<div class="button selected" id="view_'+i.toString()+'">'+blogInfo.category[i]+'</div>'
            } else {
                document.querySelector('#blognav').innerHTML += '<div class="button" id="view_'+i.toString()+'">'+blogInfo.category[i]+'</div>'
            }
            
            document.querySelector('#view'+i.toString()).addEventListener('click', function() {
                location.href = domainName + '?b=' + blog + '&p=' + blogInfo.category[i]
            })
        }

        loadPostsbyCategory(document.querySelector('.selected').innerText)

    }

} else if (blog && article) {

    document.querySelector("#page_title").style.display = 'none';

    var username = blog.split('@')[0]
    var host = blog.split('@')[1]

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
                            var mfm = parseMFM(content.text)

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

                    document.querySelector("#post_content").innerHTML = '<div id="post_title"><div style="font-size:2rem;">'+pageTitle+'</div><div style="font-size:1.2rem;">'+pageCategory+'</div></div>'
                    document.querySelector("#post_content").innerHTML += '<div><a href="'+pageUrl+'"><img class="eyecatchimg" src="'+pageImage+'"></div>'
                    console.log(result)
                    document.querySelector("#post_content").innerHTML += parseMd(result)
                    document.querySelector("#post_content").innerHTML += '<div class="usernameView"><img class="emoji" src="'+userAvatar+'"> @'+blog+'</div>'
                    document.querySelector("#post_content").innerHTML += '<div class="createdAtView">'+PageRes.createdAt+'</div>'

                }

                var pageUrl = "https://"+host+"/@"+username+"/pages/"+PageRes.name
                var pageTitle = PageRes.title
                var pageCategory = PageRes.summary.split(' #')[1]
                var pageImage = ''
                var userAvatar = PageRes.user.avatarUrl
                if (PageRes.eyeCatchingImage) {
                    pageImage = PageRes.eyeCatchingImage.url
                } else {
                    pageImage = 'https://www.eclosio.ong/wp-content/uploads/2018/08/default.png'
                }
                document.querySelector("#page_content").innerHTML += '<div id="post_content"></div>'
                makePageText(PageRes.content, PageRes.attachedFiles)
                if (signedusername == username && signedHost == host) {
                    document.querySelector("#page_content").innerHTML += '<div id="tools"><a href="./?p=editor&a='+article+'"><div class="button" id="update">수정</div></a> <a href="./?p=delete&a='+article+'"><div class="button" id="delete">삭제</div></a></div>'
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

                    const addComment = (text) => {
                        return new Promise((resolve, reject) => {
                            var commentUserHost = ''
                            if (text.user.host) {
                                commentUserHost = text.user.host
                            } else {
                                commentUserHost = host
                            }
                            var commentText = text.text.substr(text.text.indexOf('\n'))
                            commentText = parseMFM(commentText)

                            var emojinames = []
                            var emojiurl = {}
                            if (commentText.match(/\:([^\:\/\`\n\s\(\)\,\-]+)\:/g)) {
                                emojinames = commentText.match(/\:([^\:\/\`\n\s\(\)\,\-]+)\:/g)
                            }
                
                            const commentEmojiUrl = (name) => {
                                return new Promise((resolve, reject) => {
                                    var searchEmojiUrl = 'https://'+commentUserHost+'/api/emoji'
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
                                            commentText = commentText.replace(':'+name+':', '<img src="'+emojiRes.url+'" class="emoji">')
                                        }
                                        resolve()
                                    })
                                    .catch(err => {throw err});
                                })
                            }

                            const commentEmoji = async(emojinames) => {
                                if (emojinames) {
                                    for (let emojiname of emojinames) {
                                        await commentEmojiUrl(emojiname.substring(1, emojiname.length - 1))
                                    }
                                }
                                document.querySelector("#commentbox").innerHTML += '<div class="commentList"><div class="commentUser"><img class="emoji" src="'+text.user.avatarUrl+'"> @'+text.user.username+'@'+commentUserHost+'</div><div class="commentTime">'+text.createdAt+'</div><div class="commentText" id="comment'+text.id+'"><div>'+commentText+'</div></div></div>'
                                if (signedHost == commentUserHost && signedusername == text.user.username) {
                                    document.querySelector("#comment"+text.id).innerHTML += '<div class="button" id="delete'+text.id+'">삭제<div>'
                                    document.querySelector("#delete"+text.id).addEventListener('click', function(e) {
                                        var letsDelete = confirm("덧글을 삭제하시겠습니까?")

                                        if (letsDelete === true) {
                                            var deleteCommentUrl = 'https://'+signedHost+'/api/notes/delete'
                                            var deleteCommentParam = {
                                                method: 'POST',
                                                headers: {
                                                    'content-type': 'application/json',
                                                },
                                                body:  JSON.stringify({
                                                    i: token,
                                                    noteId: text.id
                                                })
                                            }
                                            fetch(deleteCommentUrl, deleteCommentParam)
                                            .then((result) => {
                                                location.href = domainName + '?b='+ username +'@'+ host +'&a='+ article
                                            })
                                            .catch(err => {throw err});
                                        } else {
                                            alert("취소되었습니다.")
                                        }
                                    })
                                }
                                resolve()
                            }
                            
                            commentEmoji(emojinames)
                        })
                    }

                    if (commentRes.length > 0) {
                        const makeCommentText = async(commentRes) => {
                            for (let comment of commentRes) {
                                await addComment(comment)
                            }
                        }
                        makeCommentText(commentRes)
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

    document.querySelector("#page_title").style.display = 'none';

    var eyeCatchImgId = ''
    var pageImage = 'https://www.eclosio.ong/wp-content/uploads/2018/08/default.png'

    if (token) {

        document.querySelector('#container').style.maxWidth = '1480px'

        document.querySelector('#page_content').innerHTML = '<div class="editor_container"><div class="editor"><input id="postTitle" placeholder="제목을 입력해주세요"></input><div id="eyeCatchImg" class="imageUploader">배경 사진을 선택해주세요</div><select id="postCategory" placeholder="카테고리를 입력해주세요"></select><input id="postUrl" placeholder="url을 지정해주세요"></input><div id="imgupload" class="imageUploader">📷</div><textarea id="editor" placeholder="내용을 입력해주세요"></textarea></div><div class="parser"><div id="post_title"><div id="titlepart"></div><div id="categorypart"></div></div><div id="imagepreview"></div><div id="contentpreview"></div></div></div><div class="button" id="postButton">게시</div>'
        for (var i = 0; i<signedBlogInfo.category.length; i++) {
            document.querySelector('#postCategory').innerHTML += '<option value="'+signedBlogInfo.category[i]+'">'+signedBlogInfo.category[i]+'</option>'
        }
        document.querySelector('#page_content').innerHTML += '<input type="file" id="eyecatchrealupload" accept="image/*" style="display: none;"><input type="file" id="imgrealupload" accept="image/*" style="display: none;">'
        document.querySelector("#imagepreview").innerHTML = '<img src="'+pageImage+'">'

        var emojinames = []
        var emojiurl = {}

        var editor = document.getElementById('editor');
        function editorChange(event) {

            resultHTML = parseMd(editor.value)

            if (event.key) {
                if (event.key  == ':') {
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
            } else {
                for (let i = 0; i < emojinames.length; i++) {
                    if (emojiurl[emojinames[i].substring(1, emojinames[i].length - 1)] && emojiurl[emojinames[i].substring(1, emojinames[i].length - 1)] !== 'undefined') {
                        resultHTML = resultHTML.replace(emojinames[i], '<img src="'+emojiurl[emojinames[i].substring(1, emojinames[i].length - 1)]+'" class="emoji">')
                    }
                }
                document.querySelector('#contentpreview').innerHTML = resultHTML
            }
        }

        function editorInitial() {

            resultHTML = parseMd(editor.value)

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
                
        }

        if (article){

            const findPageUrl = 'https://'+signedHost+'/api/pages/show'
            const findPageParam = {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    pageId: article,
                }),
            }
        
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
                            var mfm = parseMFM(content.text)
                            result += '\n' + mfm
                            resolve()
                        } else if (content.type == 'image') {
                            var fileId = content.fileId
                            var fileUrl = ''
                            for (var k = 0; k <attFiles.length; k++){
                                if (attFiles[k].id == fileId) {
                                    fileUrl = attFiles[k].url
                                }
                            }
                            result += '\n![](' + fileUrl + ')'
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
        
                    document.querySelector("#postTitle").value = pageTitle
                    document.querySelector("#titlepart").innerText = pageTitle
                    $('#postCategory').val(pageCategory).prop("selected",true)
                    document.querySelector("#categorypart").innerText = pageCategory
                    document.querySelector("#postUrl").value = pageUrl
                    document.querySelector("#imagepreview").innerHTML = '<img src="'+pageImage+'">'
                    document.querySelector("#editor").value = result
                    editorInitial()

                }
        
                var pageTitle = PageRes.title
                if (PageRes.eyeCatchingImage) {
                    eyeCatchImgId = PageRes.eyeCatchingImage.id
                    pageImage = PageRes.eyeCatchingImage.url
                    document.querySelector("#eyeCatchImg").innerText = eyeCatchImgId
                }
                var pageUrl = PageRes.name
                var pageCategory = PageRes.summary.substring(PageRes.summary.indexOf(' #')+2)
                document.querySelector("#contentpreview").innerHTML += '<div id="post_content"></div>'
                makePageText(PageRes.content, PageRes.attachedFiles)
            })
            .catch(err => {throw err});
                        
        } 

        editor.addEventListener('keyup', editorChange)
        editor.addEventListener('change', editorChange)

        var title = document.getElementById('postTitle');
        title.addEventListener('keyup', function(event){
            document.querySelector('#titlepart').innerHTML = parseMd(title.value)
        })

        var category = document.getElementById('postCategory');
        category.addEventListener('change', function(event){
            document.querySelector('#categorypart').innerHTML = parseMd(category.value)
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

            var imgReader = new FileReader();
            imgReader.onload = (e) => {
                console.log(e.target.result)
                imagePreview.innerHTML = '<img src="'+e.target.result+'">'
            };
            imgReader.readAsDataURL(this.files[0]);

            var reader = new FileReader();
            reader.onloadend = function() {
                var blob = window.dataURLtoBlob(reader.result);
                console.log('Encoded Base 64 File String:', blob);
                const formData = new FormData()
                formData.append('file', blob, {
                    filename: 'milogattachedfile.png',
                    contentType: 'image/png',
                });
                formData.append("i", token)
              
                //binaryBlob = convertDataURIToBinary(reader.result);
                //console.log('Encoded Binary File String:', binaryBlob);
                console.log(formData)
                
                var eyeCatchUrl = 'https://'+signedHost+'/api/drive/files/create'
                var eyeCatchParam = {
                    method: 'POST',
                    headers: {
                    },
                    body: formData
                }
                fetch(eyeCatchUrl, eyeCatchParam)
                .then((eyecatchData) => {return eyecatchData.json()})
                .then((eyecatchRes) => {
                    eyeCatchImgId = eyecatchRes.id
                    eyeCatchUpload.innerText = eyecatchRes.id
                })
                .catch(err => {throw err});
                
            }
            reader.readAsDataURL(this.files[0]);
            
        })

        imgRealUpload.addEventListener('change', function(e) {
            var reader = new FileReader();
            reader.onloadend = function() {
                var blob = window.dataURLtoBlob(reader.result);
                console.log('Encoded Base 64 File String:', blob);
                const formData = new FormData()
                formData.append('file', blob, {
                    filename: 'milogattachedfile.png',
                    contentType: 'image/png',
                });
                formData.append("i", token)
              
                //binaryBlob = convertDataURIToBinary(reader.result);
                //console.log('Encoded Binary File String:', binaryBlob);
                console.log(formData)
                
                var imgUploadURL = 'https://'+signedHost+'/api/drive/files/create'
                var imgUploadParam = {
                    method: 'POST',
                    headers: {
                    },
                    body: formData
                }
                //console.log(imgUploadParam.body)
                fetch(imgUploadURL, imgUploadParam)
                .then((imgData) => {return imgData.json()})
                .then((imgRes) => {
                    insertText('\n\n!['+imgRes.id+']('+imgRes.url+')\n\n')
                    console.log(parseToJSON(editor.value))
                })
                .catch(err => {throw err});
                
            }
            reader.readAsDataURL(this.files[0]);
            
        })
    
        var postButton = document.getElementById('postButton');
        var postTitle = document.getElementById('postTitle');
        var postCategory = document.getElementById('postCategory');
        var postUrl = document.getElementById('postUrl');
        postButton.addEventListener('click', function(event) {
            if (postTitle.value == '' || postUrl.value == '' || editor.value == '') {
                alert("빈칸을 모두 채워주세요!");
            } else {

                var selectedCategory = postCategory.options[postCategory.selectedIndex].value;
                var postBody = {
                    i: token,
                    title: postTitle.value,
                    name: postUrl.value,
                    summary: '#MiLog #'+selectedCategory,
                    variables: [],
                    script: '',
                    content: parseToJSON(editor.value),
                }
                if (eyeCatchImgId !== '') {
                    postBody.eyeCatchingImageId = eyeCatchImgId
                }

                var postCreateUrl
                if (article) {
                    postCreateUrl = 'https://'+signedHost+'/api/pages/update'
                    postBody.pageId = article
                } else {
                    postCreateUrl = 'https://'+signedHost+'/api/pages/create'
                }
                var postCreateParam = {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify(postBody)
                }

                if (article) {
                    fetch(postCreateUrl, postCreateParam)
                    .then(() => {
                        location.href = domainName + '?b='+ signedusername +'@'+ signedHost +'&a='+ article
                    })
                    .catch(err => {throw err});
                } else {
                    fetch(postCreateUrl, postCreateParam)
                    .then((postData) => {return postData.json()})
                    .then((postRes) => {
                        var noteCreateUrl = 'https://'+signedHost+'/api/notes/create'
                        var noteCreateParam = {
                            method: 'POST',
                            headers: {
                                'content-type': 'application/json',
                            },
                            body: JSON.stringify({
                                i: token,
                                text: 'MiLog에 새 포스트를 [게시](https://'+domainName + '?b='+ signedusername +'@'+ signedHost +'&a='+ postRes.id +') 했습니다! #MiLogNewPost',
                                visibility: 'home',
                            })
                        }
                        fetch(noteCreateUrl, noteCreateParam)
                        .then((noteData) => {return noteData.json()})
                        .then((noteRes) => {
                            location.href = domainName + '?b='+ signedusername +'@'+ signedHost +'&a='+ postRes.id
                        })
                        .catch(err => {throw err});
                    })
                }
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
} else if (page == 'setting') {

    if (token) {

        document.querySelector('#page_title').innerText = '블로그 설정'
        document.querySelector('#page_content').innerHTML = '<div class="setting_container"><div>블로그 제목:</div><input id="blogTitle" value="'+signedBlogInfo.blogTitle+'"></input><div>블로그 소개:</div><textarea id="blogIntro">'+signedBlogInfo.blogIntro+'</textarea><div>테마 색상:<br>(블로그의 테마 색상을 변경하는 것이 아닌, 여러분의 브라우저에서 보이는 사이트 전체의 테마 색상을 변경하는 것입니다.)</div><input id="blogTheme" value="'+signedBlogInfo.theme+'"></input><div>카테고리:<br>(개행으로 구분합니다. 최소 1개의 카테고리는 남겨 두셔야 글을 작성하실 수 있습니다.)</div><textarea id="category">'+signedBlogInfo.category+'</textarea></div><div class="button" id="settingChange">설정 변경</div>'

        var settingChange = document.getElementById('settingChange');
        var blogTitle = document.getElementById('blogTitle')
        var blogIntro = document.getElementById('blogIntro')
        var blogTheme = document.getElementById('blogTheme')
        var category = document.getElementById('category');
        settingChange.addEventListener('click', function(event) {
            if (blogTitle.value == '' || blogIntro.value == '' || blogTheme.value == '' || category.value == '') {
                alert("빈칸을 모두 채워주세요!");
            } else {

                signedBlogInfo.blogTitle = blogTitle.value.replace('`', '&#x60;').replace('"', '&quot;')
                signedBlogInfo.blogIntro = blogIntro.value.replace('`', '&#x60;').replace('"', '&quot;')
                signedBlogInfo.theme = blogTheme.value.replace('`', '&#x60;').replace('"', '&quot;')
                signedBlogInfo.category = category.value.replace('`', '&#x60;').replace('"', '&quot;').split('\n')

                localStorage.setItem('blogInfo', JSON.stringify(signedBlogInfo))

                var pageUpdateUrl = 'https://'+signedHost+'/api/pages/update'
                var pageUpdateParam = {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify({
                        i: token,
                        pageId: signedBlogInfoId,
                        title: 'MiLogSetup',
                        name: 'milogsetup',
                        summary: '#MiLogSetup',
                        variables: [],
                        script: '',
                        content: [{
                            text: 'Setting: `'+JSON.stringify(signedBlogInfo)+'`',
                            type: 'text'
                        }]
                    })
                }

                fetch(pageUpdateUrl, pageUpdateParam)
                .then(() => {
                    location.href = domainName + '?b='+ signedusername +'@'+ signedHost
                })
                .catch(err => {throw err});
            }
        })
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