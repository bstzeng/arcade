// Exact reverse breadth-first search. Identical rectangles are indistinguishable.
// A straight slide of any positive length costs one move; turns cost another.
#include <bits/stdc++.h>
using namespace std; using U=uint64_t;
int V,H,N=10; vector<int> W,HT; uint32_t masks[4][20];
U encode(vector<int> p){sort(p.begin()+1,p.begin()+1+V);sort(p.begin()+1+V,p.begin()+6);sort(p.begin()+6,p.end());U k=0;for(int i=0;i<N;i++)k|=U(p[i])<<(5*i);return k;}
vector<int> decode(U k){vector<int>p(N);for(int i=0;i<N;i++)p[i]=(k>>(5*i))&31;return p;}
int shape(int i){return i==0?0:i<=V?1:i<6?2:3;}
struct Node {U k;int parent;uint16_t dist;uint8_t from,to,w,h;};
vector<Node> nodes;unordered_map<U,int> seen;
void goals(vector<int>&p,int i,uint32_t occ){if(i==N){U k=encode(p);if(seen.emplace(k,nodes.size()).second)nodes.push_back({k,-1,0,0,0,0,0});return;}int lo=i>1&&shape(i)==shape(i-1)?p[i-1]+1:0;for(int pos=lo;pos<20;pos++){uint32_t m=masks[shape(i)][pos];if(m&&!(m&occ)){p[i]=pos;goals(p,i+1,occ|m);}}}
U mirrored(U k){auto p=decode(k);for(int i=0;i<N;i++)p[i]=(p[i]/4)*4+4-W[i]-(p[i]%4);return encode(p);}
int main(int argc,char**argv){V=argc>1?atoi(argv[1]):4;H=5-V;int count=argc>2?atoi(argv[2]):13;W={2};HT={2};for(int i=0;i<V;i++){W.push_back(1);HT.push_back(2);}for(int i=0;i<H;i++){W.push_back(2);HT.push_back(1);}for(int i=0;i<4;i++){W.push_back(1);HT.push_back(1);}int ws[4]={2,1,2,1},hs[4]={2,2,1,1};for(int s=0;s<4;s++)for(int p=0;p<20;p++){int x=p%4,y=p/4;if(x+ws[s]>4||y+hs[s]>5)continue;uint32_t m=0;for(int dy=0;dy<hs[s];dy++)for(int dx=0;dx<ws[s];dx++)m|=1u<<(p+dy*4+dx);masks[s][p]=m;}
seen.reserve(1500000);vector<int> p(N);p[0]=13;goals(p,1,masks[0][13]);cerr<<"V="<<V<<" goals="<<nodes.size()<<endl;
for(size_t head=0;head<nodes.size();head++){Node cur=nodes[head];p=decode(cur.k);uint32_t occ=0;for(int i=0;i<N;i++)occ|=masks[shape(i)][p[i]];for(int i=0;i<N;i++){int old=p[i];uint32_t rest=occ^masks[shape(i)][old];for(int d=0;d<4;d++){int dx=d==0?-1:d==1?1:0,dy=d==2?-1:d==3?1:0;for(int step=1;step<5;step++){int x=old%4+dx*step,y=old/4+dy*step;if(x<0||x+W[i]>4||y<0||y+HT[i]>5)break;int np=y*4+x;uint32_t m=masks[shape(i)][np];if(rest&m)break;p[i]=np;U k=encode(p);auto ins=seen.emplace(k,nodes.size());if(ins.second)nodes.push_back({k,(int)head,(uint16_t)(cur.dist+1),(uint8_t)np,(uint8_t)old,(uint8_t)W[i],(uint8_t)HT[i]});}p[i]=old;}}}
int maxD=0;for(auto&n:nodes)maxD=max(maxD,(int)n.dist);cerr<<"V="<<V<<" states="<<nodes.size()<<" max="<<maxD<<endl;
// Diverse target depths across each family; maximize shape-layout difference to prior picks.
vector<int> chosen;set<U> unique;auto grid=[&](U k){array<int,20>a{};auto p=decode(k);for(int i=0;i<N;i++)for(int dy=0;dy<HT[i];dy++)for(int dx=0;dx<W[i];dx++)a[p[i]+dy*4+dx]=shape(i)+1;return a;};
for(int t=0;t<count;t++){int desired=8+(maxD-8)*t/(count-1),best=-1,score=-1;for(int j=0;j<(int)nodes.size();j++){auto&n=nodes[j];if(n.dist!=desired)continue;U canon=min(n.k,mirrored(n.k));if(unique.count(canon))continue;auto a=grid(n.k),am=grid(mirrored(n.k));int md=100;for(int q:chosen){auto b=grid(nodes[q].k);int d=0,dm=0;for(int i=0;i<20;i++){d+=a[i]!=b[i];dm+=am[i]!=b[i];}md=min(md,min(d,dm));} // stable deterministic tie-break by the encoded state
if(md>score||(md==score&&(best<0||n.k<nodes[best].k))){best=j;score=md;}}
if(best<0){cerr<<"selection failed";return 1;}chosen.push_back(best);unique.insert(min(nodes[best].k,mirrored(nodes[best].k)));}
cout<<"{\"vertical\":"<<V<<",\"horizontal\":"<<H<<",\"reachableStates\":"<<nodes.size()<<",\"maxDistance\":"<<maxD<<",\"levels\":[";bool first=true;for(int idx:chosen){if(!first)cout<<",";first=false;auto p=decode(nodes[idx].k);cout<<"{\"pieces\":[";for(int i=0;i<N;i++){if(i)cout<<",";cout<<"["<<p[i]%4<<","<<p[i]/4<<","<<W[i]<<","<<HT[i]<<"]";}cout<<"],\"optimal\":"<<nodes[idx].dist<<",\"solution\":[";bool fm=true;for(int k=idx;nodes[k].parent>=0;k=nodes[k].parent){auto&n=nodes[k];if(!fm)cout<<",";fm=false;cout<<"["<<(int)n.from<<","<<(int)n.to<<","<<(int)n.w<<","<<(int)n.h<<"]";}cout<<"]}";}cout<<"]}";
}
