/* === FILE: snippets.js === */
(function(){
  const PY_EASY = [
`for i in range(3):
    print(i)`,
`s = 'racecar'
print(s == s[::-1])`,
`nums = [1,2,3]
print(sum(nums))`,
`def add(a,b):
    return a+b`,
  ];
  const PY_MED = [
`def is_prime(n):
    if n < 2: return False
    for i in range(2,int(n**0.5)+1):
        if n % i == 0: return False
    return True`,
`from collections import Counter
print(Counter('banana'))`,
`def rev_words(s):
    return ' '.join(reversed(s.split()))`,
`nums=[3,1,2]
for x in sorted(nums):
    print(x)`,
  ];
  const PY_HARD = [
`def fib(n, memo={}):
    if n < 2: return n
    if n in memo: return memo[n]
    memo[n] = fib(n-1,memo)+fib(n-2,memo)
    return memo[n]`,
`def two_sum(a,t):
    seen={}
    for i,x in enumerate(a):
        if t-x in seen: return (seen[t-x],i)
        seen[x]=i`,
`class Node:
    def __init__(self,v,n=None):
        self.v,self.n=v,n
    def __repr__(self):
        return f'Node({self.v})'`,
  ];

  const JS_EASY = [
`const nums=[1,2,3];
console.log(nums.reduce((a,b)=>a+b,0));`,
`function rev(s){return s.split('').reverse().join('')}
console.log(rev('hello'))`,
`for(let i=0;i<3;i++){console.log(i)}`,
`const isEven=n=>n%2===0;
console.log(isEven(4))`,
  ];
  const JS_MED = [
`function isPrime(n){
  if(n<2)return false;
  for(let i=2;i*i<=n;i++) if(n%i===0) return false;
  return true;
}`,
`const freq=s=>[...s].reduce((m,c)=>(m[c]=(m[c]||0)+1,m),{});
console.log(freq('banana'));`,
`const uniq=a=>[...new Set(a)];
console.log(uniq([1,1,2,3]));`,
`const sum=(a)=>a.reduce((x,y)=>x+y,0);
console.log(sum([3,1,2]));`,
  ];
  const JS_HARD = [
`const twoSum=(a,t)=>{const m=new Map();for(let i=0;i<a.length;i++){const x=a[i];if(m.has(t-x))return [m.get(t-x),i];m.set(x,i);}return null;}`,
`const memoFib=(n,m={})=>n<2?n:(m[n]??(m[n]=memoFib(n-1,m)+memoFib(n-2,m)))`,
`class Node{
  constructor(v,n=null){this.v=v;this.n=n;}
  toString(){return \`Node(${"${"}this.v})\`;}
}`,
  ];

  const C_EASY = [
`#include <stdio.h>
int main(){for(int i=0;i<3;i++) printf("%d\n",i);}`,
`#include <stdio.h>
int add(int a,int b){return a+b;}
int main(){printf("%d",add(2,3));}`,
`#include <stdio.h>
int main(){int a=5;printf(a%2==0?"even":"odd");}`,
  ];
  const C_MED = [
`#include <stdio.h>
int isPrime(int n){if(n<2)return 0;for(int i=2;i*i<=n;i++) if(n%i==0) return 0;return 1;}
int main(){printf("%d",isPrime(7));}`,
`#include <stdio.h>
int main(){int a[3]={3,1,2};for(int i=0;i<3;i++) printf("%d ",a[i]);}`,
`#include <stdio.h>
void swap(int *a,int *b){int t=*a;*a=*b;*b=t;}
int main(){int x=1,y=2;swap(&x,&y);printf("%d %d",x,y);}`,
  ];
  const C_HARD = [
`#include <stdio.h>
int two_sum(int *a,int n,int t){for(int i=0;i<n;i++)for(int j=i+1;j<n;j++)if(a[i]+a[j]==t)return 1;return 0;}
int main(){int a[4]={2,7,11,15};printf("%d",two_sum(a,4,9));}`,
`#include <stdio.h>
int fib(int n){return n<2?n:fib(n-1)+fib(n-2);}
int main(){printf("%d",fib(10));}`,
  ];

  window.SNIPPETS = {
    python:{easy:PY_EASY, medium:PY_MED, hard:PY_HARD},
    javascript:{easy:JS_EASY, medium:JS_MED, hard:JS_HARD},
    c:{easy:C_EASY, medium:C_MED, hard:C_HARD}
  };
})();