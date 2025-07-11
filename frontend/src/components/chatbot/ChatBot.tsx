import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/common/Button';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
}

interface ChatBotProps {
  className?: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "👋 **Welcome to Vermeg!**\n\nI'm your personal recruitment assistant, here to guide you through your career journey with us. Whether you're looking to apply for a position, create your profile, or learn about our company, I'm here to help!\n\n✨ **What can I help you with today?**",
      isBot: true,
      timestamp: new Date(),
      suggestions: [
        "How do I apply for a job?",
        "How to create my profile?",
        "What are the interview steps?",
        "Tell me about Vermeg"
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): { text: string; suggestions?: string[] } => {
    const message = userMessage.toLowerCase();

    if (message.includes('apply') || message.includes('application')) {
      return {
        text: "🚀 **How to Apply for a Job:**\n\n1. **Browse Jobs** - Visit our careers section or use the job search\n2. **Select Position** - Click on a job that matches your skills\n3. **Apply Now** - Click the 'Apply Now' button\n4. **Complete Form** - Fill out the application form carefully\n5. **Upload Documents** - Add your CV, cover letter, and portfolio\n6. **Submit** - Review and submit your application\n\n📊 Track your progress in the 'My Applications' dashboard!",
        suggestions: ["How to create a profile?", "What documents do I need?", "How long does the process take?"]
      };
    }
    
    if (message.includes('profile') || message.includes('account')) {
      return {
        text: "👤 **Creating Your Profile:**\n\n1. **Sign Up** - Click 'Sign Up' in the top navigation\n2. **Choose Role** - Select 'Candidate' as your account type\n3. **Personal Info** - Add your contact details and basic information\n4. **Experience** - Include your work history and education\n5. **Upload Media** - Add your professional photo and CV\n6. **Skills** - List your technical and soft skills\n\n💡 **Pro Tip:** Complete profiles get 3x more recruiter views!",
        suggestions: ["How to edit my profile?", "What makes a good profile?", "How to upload documents?"]
      };
    }
    
    if (message.includes('interview') || message.includes('process')) {
      return {
        text: "🎯 **Our Interview Process:**\n\n**Step 1: Application Review** 📋\n• HR team reviews your application\n• Initial screening for requirements\n\n**Step 2: Technical Assessment** 💻\n• Role-specific technical tests\n• Skills evaluation\n\n**Step 3: HR Interview** 🤝\n• Behavioral assessment\n• Cultural fit evaluation\n\n**Step 4: Final Decision** ✅\n• Feedback and next steps\n• Job offer or recommendations\n\n📱 Get real-time updates via notifications!",
        suggestions: ["How to prepare for interviews?", "What types of tests are there?", "How long does it take?"]
      };
    }
    
    if (message.includes('track') || message.includes('status')) {
      return {
        text: "To track your applications:\n1. Log into your account\n2. Go to 'My Applications' section\n3. View status of each application\n4. Check for updates and notifications\n\nApplication statuses include: Submitted, Under Review, Interview Scheduled, Decision Pending, Accepted/Rejected.",
        suggestions: ["What do the statuses mean?", "How often are statuses updated?", "Can I withdraw an application?"]
      };
    }
    
    if (message.includes('help') || message.includes('support')) {
      return {
        text: "I'm here to help! You can ask me about:\n• Job application process\n• Creating and managing your profile\n• Interview preparation\n• Platform navigation\n• Technical issues\n\nFor urgent matters, contact our support team at support@vermeg.com",
        suggestions: ["How to apply for jobs?", "Profile creation help", "Interview process", "Technical support"]
      };
    }
    
    if (message.includes('document') || message.includes('cv') || message.includes('resume')) {
      return {
        text: "📄 **Document Requirements:**\n\n• **CV/Resume** - PDF format, max 5MB\n• **Cover Letter** - Optional but recommended\n• **Portfolio** - For design/development roles\n• **Certificates** - Relevant certifications\n\n💡 **Pro Tips:**\n• Tailor your CV to each position\n• Use clear, professional formatting\n• Include quantifiable achievements",
        suggestions: ["CV writing tips", "What format is best?", "How to upload documents?"]
      };
    }

    if (message.includes('salary') || message.includes('pay') || message.includes('compensation')) {
      return {
        text: "💰 **Compensation Information:**\n\nSalary ranges are displayed on each job posting. Our compensation packages typically include:\n\n• Competitive base salary\n• Performance bonuses\n• Health insurance\n• Professional development budget\n• Flexible working arrangements\n\nSpecific details will be discussed during the interview process.",
        suggestions: ["Benefits information", "How to negotiate salary?", "When is salary discussed?"]
      };
    }

    if (message.includes('remote') || message.includes('work from home') || message.includes('hybrid')) {
      return {
        text: "🏠 **Remote Work Options:**\n\nWe offer flexible work arrangements:\n\n• **Remote** - Work from anywhere\n• **Hybrid** - Mix of office and remote\n• **On-site** - Traditional office work\n\nWork arrangement is specified in each job posting. Many of our positions offer hybrid or fully remote options!",
        suggestions: ["Which jobs are remote?", "Hybrid work policy", "Office locations"]
      };
    }

    if (message.includes('vermeg') || message.includes('company') || message.includes('about')) {
      return {
        text: "🏢 **About Vermeg:**\n\nVermeg is a leading financial technology company with:\n\n• **15+ years** of industry experience\n• **50+ countries** worldwide presence\n• **1000+ employees** globally\n• **100+ clients** trusting our solutions\n\nWe specialize in cutting-edge fintech solutions, helping financial institutions transform their operations with innovative technology.",
        suggestions: ["Company culture", "Office locations", "Career growth opportunities"]
      };
    }

    // Default response
    return {
      text: "👋 I'd be happy to help! I can assist you with:\n\n• Job applications and requirements\n• Profile creation and optimization\n• Interview process and preparation\n• Platform navigation\n• Company information\n• Remote work options\n\nWhat would you like to know more about?",
      suggestions: ["Job application help", "Profile setup", "Interview process", "About Vermeg"]
    };
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = getBotResponse(inputText);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.text,
        isBot: true,
        timestamp: new Date(),
        suggestions: botResponse.suggestions
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <div className="relative">
              <MessageCircle className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          )}
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[500px]'}`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Vermeg Assistant</h3>
                <p className="text-white/80 text-xs">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] ${message.isBot ? 'order-2' : 'order-1'}`}>
                      <div className={`rounded-2xl px-4 py-2 ${
                        message.isBot 
                          ? 'bg-white text-gray-800 shadow-sm border border-gray-100' 
                          : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                      }`}>
                        <div className="flex items-start space-x-2">
                          {message.isBot && (
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                              <Sparkles className="w-3 h-3 text-red-500" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-line">{message.text}</p>
                            <p className={`text-xs mt-1 ${message.isBot ? 'text-gray-500' : 'text-white/70'}`}>
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Suggestions */}
                      {message.suggestions && (
                        <div className="mt-2 space-y-1">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors text-gray-600"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {!message.isBot && (
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center ml-2 mt-1 flex-shrink-0 order-2">
                        <User className="w-3 h-3 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl px-4 py-2 shadow-sm border border-gray-100">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about Vermeg..."
                      className="w-full resize-none border border-gray-300 rounded-xl px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      rows={1}
                      style={{ minHeight: '40px', maxHeight: '80px' }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputText.trim()}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg flex items-center justify-center hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBot;
