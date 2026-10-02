// Deterministic 6x6 Rush Hour generator. Compile with g++ -O3 -std=c++17.
// Enumerates each candidate's entire connected state component, then runs
// multi-source BFS from EVERY goal state to certify exact shortest slide counts.
#include <algorithm>
#include <array>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <queue>
#include <random>
#include <set>
#include <sstream>
#include <unordered_map>
#include <vector>
using namespace std;
struct Car {int axis,lane,len;};
struct Puzzle {vector<Car> cars; vector<int> pos;vector<array<int,2>> path;int states,goals,distance;uint32_t candidate;};
vector<Car> cs;uint64_t masks[16][6];int n;
void setup(){n=cs.size();for(int i=0;i<n;i++)for(int p=0;p<=6-cs[i].len;p++){uint64_t m=0;for(int k=0;k<cs[i].len;k++)m|=1ULL<<(cs[i].axis? (p+k)*6+cs[i].lane:cs[i].lane*6+p+k);masks[i][p]=m;}}
template<class F> void edges(uint64_t s,F f){uint64_t occ=0;for(int i=0;i<n;i++)occ|=masks[i][(s>>(3*i))&7];for(int i=0;i<n;i++){int p=(s>>(3*i))&7;uint64_t other=occ^masks[i][p],clr=s&~(7ULL<<(3*i));for(int sign:{-1,1})for(int q=p+sign;q>=0&&q<=6-cs[i].len;q+=sign){if(masks[i][q]&other)break;f(clr|(uint64_t(q)<<(3*i)),i,q);}}}
string topology(const vector<Car>& cars){vector<string>a;for(size_t i=1;i<cars.size();i++){auto c=cars[i];a.push_back(to_string(c.axis)+to_string(c.lane)+to_string(c.len));}sort(a.begin(),a.end());string s;for(auto t:a)s+=t+",";return s;}
int main(int argc,char**argv){string output=argc>1?argv[1]:"levels.json";mt19937 rng(0x52485336);vector<Puzzle> pool;set<string> topologies;int attempts=0; const int CAP=180000; int quota[5]={10,10,10,10,10},counts[5]={};
while(pool.size()<50&&attempts<120000){attempts++;cs={{0,2,2}};vector<int> ps={int(rng()%4)};uint64_t occ=3ULL<<(12+ps[0]);int wanted=9+rng()%6;for(int tries=0;tries<450&&int(cs.size())<wanted;tries++){Car c={int(rng()%2),int(rng()%6),rng()%5==0?3:2};if(c.axis==0&&c.lane==2)continue;int p=rng()%(7-c.len);uint64_t m=0;for(int k=0;k<c.len;k++)m|=1ULL<<(c.axis?(p+k)*6+c.lane:c.lane*6+p+k);if(!(occ&m)){cs.push_back(c);ps.push_back(p);occ|=m;}}
if(cs.size()<8)continue;string sig=topology(cs);if(topologies.count(sig))continue;setup();uint64_t initial=0;for(int i=0;i<n;i++)initial|=uint64_t(ps[i])<<(i*3);vector<uint64_t> states;states.reserve(16000);unordered_map<uint64_t,int> id;id.reserve(30000);states.push_back(initial);id.emplace(initial,0);vector<int> goals;bool large=false;
for(size_t h=0;h<states.size();h++){uint64_t s=states[h];if((s&7)==4)goals.push_back(h);edges(s,[&](uint64_t t,int,int){if(large)return;auto a=id.emplace(t,states.size());if(a.second){states.push_back(t);if(states.size()>CAP)large=true;}});if(large)break;}
if(large||goals.empty())continue;vector<int>d(states.size(),-1),next(states.size(),-1);vector<array<int,2>> move(states.size());vector<int>q=goals;for(int g:goals)d[g]=0;int far=0;for(size_t h=0;h<q.size();h++){int cur=q[h];if(d[cur]>d[far])far=cur;edges(states[cur],[&](uint64_t t,int car,int pos){int k=id.at(t);if(d[k]<0){d[k]=d[cur]+1;next[k]=cur;move[k]={car,int((states[cur]>>(3*car))&7)};q.push_back(k);}});}
int depth=d[far],bucket=depth<8?-1:depth<12?0:depth<16?1:depth<20?2:depth<25?3:4;
if(bucket<0||counts[bucket]>=quota[bucket])continue;Puzzle p;p.cars=cs;p.states=states.size();p.goals=goals.size();p.distance=depth;p.candidate=attempts;for(int i=0;i<n;i++)p.pos.push_back((states[far]>>(3*i))&7);for(int k=far;d[k]>0;k=next[k])p.path.push_back(move[k]);pool.push_back(p);topologies.insert(sig);counts[bucket]++;cerr<<"accepted "<<pool.size()<<" attempt "<<attempts<<" cars "<<n<<" distance "<<depth<<" states "<<states.size()<<" buckets ";for(int c:counts)cerr<<c<<' ';cerr<<'\n';}
if(pool.size()!=50){cerr<<"Could not satisfy quotas; collected "<<pool.size()<<"\n";return 2;}sort(pool.begin(),pool.end(),[](const Puzzle&a,const Puzzle&b){return a.distance<b.distance||(a.distance==b.distance&&a.candidate<b.candidate);});ofstream out(output);out<<"{\"version\":1,\"seed\":1380471606,\"metric\":\"one axial slide of any positive distance\",\"levels\":[\n";int num=0;for(auto&p:pool){if(num)out<<",\n";out<<"{\"id\":"<<++num<<",\"difficulty\":"<<(num-1)/10+1<<",\"optimal\":"<<p.distance<<",\"candidate\":"<<p.candidate<<",\"componentStates\":"<<p.states<<",\"goalStates\":"<<p.goals<<",\"cars\":[";for(size_t i=0;i<p.cars.size();i++){if(i)out<<',';auto c=p.cars[i];out<<"[\""<<(c.axis?"V":"H")<<"\","<<c.lane<<','<<c.len<<']';}out<<"],\"start\":[";for(size_t i=0;i<p.pos.size();i++){if(i)out<<',';out<<p.pos[i];}out<<"],\"solution\":[";for(size_t i=0;i<p.path.size();i++){if(i)out<<',';out<<'['<<p.path[i][0]<<','<<p.path[i][1]<<']';}out<<"]}";}out<<"\n]}\n";cerr<<"Generated 50 exact puzzles after "<<attempts<<" candidates\n";}
