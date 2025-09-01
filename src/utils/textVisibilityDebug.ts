// Text visibility debugging utility

export const debugTextVisibility = () => {
  console.log('🔍 Debugging text visibility...');
  
  // Check if Tailwind CSS is loaded
  const testElement = document.createElement('div');
  testElement.className = 'text-gray-900';
  document.body.appendChild(testElement);
  
  const computedStyle = window.getComputedStyle(testElement);
  const textColor = computedStyle.color;
  
  console.log('📊 Text color test results:');
  console.log(`- text-gray-900 computed color: ${textColor}`);
  console.log(`- Expected: rgb(17, 24, 39) or #111827`);
  
  document.body.removeChild(testElement);
  
  // Check for conflicting styles
  const allElements = document.querySelectorAll('*');
  const elementsWithWhiteText = Array.from(allElements).filter(el => {
    const style = window.getComputedStyle(el);
    return style.color === 'rgb(255, 255, 255)' || style.color === '#ffffff' || style.color === 'white';
  });
  
  if (elementsWithWhiteText.length > 0) {
    console.warn('⚠️ Found elements with white text that might be invisible:');
    elementsWithWhiteText.forEach((el, index) => {
      if (index < 10) { // Limit to first 10 to avoid spam
        console.log(`- ${el.tagName.toLowerCase()}${el.className ? '.' + el.className.split(' ').join('.') : ''}`, el);
      }
    });
  }
  
  // Check for elements without explicit text color
  const elementsWithoutTextColor = Array.from(allElements).filter(el => {
    const style = window.getComputedStyle(el);
    const hasTextContent = el.textContent && el.textContent.trim().length > 0;
    const hasExplicitColor = el.className.includes('text-') || style.color !== 'rgb(17, 24, 39)';
    return hasTextContent && !hasExplicitColor;
  });
  
  if (elementsWithoutTextColor.length > 0) {
    console.info('ℹ️ Elements that might benefit from explicit text color classes:');
    elementsWithoutTextColor.forEach((el, index) => {
      if (index < 5) { // Limit to first 5
        console.log(`- ${el.tagName.toLowerCase()}${el.className ? '.' + el.className.split(' ').join('.') : ''}:`, el.textContent?.substring(0, 50));
      }
    });
  }
  
  return {
    tailwindWorking: textColor === 'rgb(17, 24, 39)',
    whiteTextElements: elementsWithWhiteText.length,
    elementsNeedingColor: elementsWithoutTextColor.length
  };
};

// Auto-fix function to add text color classes where needed
export const autoFixTextVisibility = () => {
  console.log('🔧 Auto-fixing text visibility...');
  
  const allElements = document.querySelectorAll('*');
  let fixedCount = 0;
  
  allElements.forEach(el => {
    const style = window.getComputedStyle(el);
    const hasTextContent = el.textContent && el.textContent.trim().length > 0;
    const isWhiteText = style.color === 'rgb(255, 255, 255)' || style.color === '#ffffff' || style.color === 'white';
    const hasWhiteBackground = style.backgroundColor === 'rgb(255, 255, 255)' || style.backgroundColor === '#ffffff' || style.backgroundColor === 'white';
    
    // Fix white text on white/light backgrounds
    if (hasTextContent && isWhiteText && hasWhiteBackground) {
      el.classList.add('text-gray-900');
      fixedCount++;
    }
    
    // Add text color to elements that might need it
    if (hasTextContent && !el.className.includes('text-') && el.tagName.match(/^(P|SPAN|DIV|H[1-6]|LABEL)$/)) {
      el.classList.add('text-gray-900');
      fixedCount++;
    }
  });
  
  console.log(`✅ Fixed ${fixedCount} elements`);
  return fixedCount;
};

// Function to highlight elements with potential text visibility issues
export const highlightTextIssues = (enable: boolean = true) => {
  const styleId = 'text-visibility-debug';
  let existingStyle = document.getElementById(styleId);
  
  if (existingStyle) {
    existingStyle.remove();
  }
  
  if (enable) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Highlight elements with white text */
      *[style*="color: white"],
      *[style*="color: #ffffff"],
      *[style*="color: rgb(255, 255, 255)"] {
        background-color: rgba(255, 0, 0, 0.3) !important;
        border: 2px solid red !important;
      }
      
      /* Highlight elements that might need text color */
      p:not([class*="text-"]),
      span:not([class*="text-"]),
      div:not([class*="text-"]):not(:empty),
      h1:not([class*="text-"]),
      h2:not([class*="text-"]),
      h3:not([class*="text-"]),
      h4:not([class*="text-"]),
      h5:not([class*="text-"]),
      h6:not([class*="text-"]) {
        background-color: rgba(255, 255, 0, 0.2) !important;
        border: 1px dashed orange !important;
      }
    `;
    document.head.appendChild(style);
    console.log('🎨 Text visibility debugging highlights enabled');
  } else {
    console.log('🎨 Text visibility debugging highlights disabled');
  }
};

// Development helper - only run in development mode
if (process.env.NODE_ENV === 'development') {
  // Make functions available globally for console debugging
  (window as any).debugTextVisibility = debugTextVisibility;
  (window as any).autoFixTextVisibility = autoFixTextVisibility;
  (window as any).highlightTextIssues = highlightTextIssues;
  
  console.log('🛠️ Text visibility debug tools available:');
  console.log('- debugTextVisibility() - Analyze text visibility issues');
  console.log('- autoFixTextVisibility() - Automatically fix common issues');
  console.log('- highlightTextIssues(true/false) - Visually highlight problematic elements');
}