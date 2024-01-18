# Origin of the project

Hello everyone, I am Cyberhan.

With the rise of `chatgpt`, I became interested in AI, and more coincidentally, I came into contact with `llama.cpp`. 
I am a full-stack developer (full-stack development), but I am not familiar with AI development, so I I made the wrong decision to get started.
I bought the cheapest AMD 7900xtx based on the video memory.
I found that it couldn't be used on Windows. 
I was tortured by switching between Linux and Windows until ggml and AMD supported Windows.
I Started a support project, `rocm` compilation of rwkv.cpp.

Then I came into contact with stable-diffusion.cpp. In a PR, [FSSRepo](https://github.com/FSSRepo) mentioned the original sd webui. 
I happened to be using [purego](https://github.com/ebitengine/purego) to complete the binding of my golang library with `stable-diffusion.cpp`.
(purego is a black magic method for calling dynamic libraries without using cgo)

What I'm good at is golang and javascript (typescript). 
I use them for web development and desktop development.

So I borrowed (plagiarized) his webui interface, but now the layout looks similar (Not very similar, hi hi).
except that the underlying technology stack has been replaced by me. 
He was that the person who opened my inspiration.

Also thanks to [Amin456789](https://github.com/Amin456789) who started using this crappy app from the beginning.
And the author [leejet](https://github.com/leejet) of `stable-diffusion.cpp` who has been working hard has helped me a lot and allowed me to learn a lot of c/c++ and cmake knowledge.

Finally, thank you to everyone who uses this application and will use this application. 
Your feedback and star are the motivation for me to continue development.
